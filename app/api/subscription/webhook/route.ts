import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logger } from '@/lib/server/logger';
import { getPaymentById } from '@/lib/payments/payment-integration';
import { withTransaction } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function __resetWebhookReplayCacheForTests(): void {
  // The database fulfillment ledger is the replay protection source of truth.
}

function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const provided = Buffer.from(signature, 'hex');
  const expected = Buffer.from(createHmac('sha256', secret).update(payload).digest('hex'), 'hex');
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function webhookEnabled(): boolean {
  return (
    process.env['PAYMENT_WEBHOOK_ENABLED'] === 'true' &&
    process.env['PAYMENT_WEBHOOK_PROVIDER'] === 'internal'
  );
}

function validIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128;
}

function parseMetadata(value: string | Record<string, unknown> | null): Record<string, unknown> {
  if (!value) return {};
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  if (!isFeatureEnabled('subscription')) return disabledApiResponse('subscription');
  if (!webhookEnabled()) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const rawBody = await request.text();
  const webhookSecret = process.env['PAYMENT_WEBHOOK_SECRET']?.trim() ?? '';
  if (!webhookSecret) {
    logger.error('PAYMENT_WEBHOOK_SECRET is not configured — rejecting webhook');
    return NextResponse.json({ ok: false, error: 'Webhook unavailable' }, { status: 503 });
  }

  const signature =
    request.headers.get('x-webhook-signature') ?? request.headers.get('x-signature');
  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    logger.warn('Webhook signature verification failed');
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const paymentId = body['paymentId'];
  const status = body['status'];
  const transactionId = body['transactionId'];
  if (!validIdentifier(paymentId)) {
    return NextResponse.json({ ok: false, error: 'paymentId is required' }, { status: 400 });
  }
  if (status !== 'completed' && status !== 'success') {
    return NextResponse.json({ ok: false, error: 'Unsupported payment status' }, { status: 400 });
  }

  const payment = await getPaymentById(paymentId);
  if (!payment) {
    logger.warn('Webhook received for unknown payment', { paymentId });
    return NextResponse.json({ ok: false, error: 'Payment not found' }, { status: 404 });
  }
  if (payment.gatewayName === 'zarinpal' || payment.method === 'zarinpal') {
    logger.warn('Blocked webhook completion for Zarinpal payment', { paymentId });
    return NextResponse.json(
      { ok: false, error: 'Zarinpal payments require gateway verification' },
      { status: 409 },
    );
  }

  try {
    const outcome = await withTransaction(async (txQuery) => {
      const lockResult = await txQuery<{
        id: string;
        user_id: string;
        status: string;
        metadata: Record<string, unknown> | string | null;
      }>('SELECT id, user_id, status, metadata FROM payments WHERE id = $1 FOR UPDATE', [paymentId]);
      const lockedPayment = lockResult.rows[0];
      if (!lockedPayment) return 'not_found' as const;

      const fulfillmentResult = await txQuery<{ subscription_id: string | null }>(
        'SELECT subscription_id FROM payment_fulfillments WHERE payment_id = $1 LIMIT 1',
        [paymentId],
      );
      if (fulfillmentResult.rows.length > 0) return 'already_processed' as const;
      if (lockedPayment.status === 'completed') return 'missing_ledger' as const;
      if (lockedPayment.status !== 'pending') return 'invalid_state' as const;

      const metadata = parseMetadata(lockedPayment.metadata);
      const rawPlanId = metadata['planId'];
      const planId = typeof rawPlanId === 'string' ? rawPlanId : undefined;
      const refId = validIdentifier(transactionId) ? transactionId : null;
      const now = Date.now();

      await txQuery(
        `UPDATE payments
         SET status = 'completed', completed_at = $1,
             gateway_ref_id = COALESCE(gateway_ref_id, $2),
             failure_code = NULL, failure_message = NULL
         WHERE id = $3 AND status = 'pending'`,
        [now, refId, paymentId],
      );
      if (!planId) return 'completed' as const;

      const rawPeriodDays = Number(metadata['periodDays'] ?? 30);
      const periodDays =
        Number.isSafeInteger(rawPeriodDays) && rawPeriodDays > 0 && rawPeriodDays <= 366
          ? rawPeriodDays
          : 30;
      const durationMs = periodDays * 24 * 60 * 60 * 1000;
      const existingResult = await txQuery<{
        id: string;
        plan_id: string;
        expires_at: number | string;
      }>(
        `SELECT id, plan_id, expires_at FROM subscriptions
         WHERE user_id = $1 AND status = 'active' AND expires_at > $2
         ORDER BY expires_at DESC LIMIT 1 FOR UPDATE`,
        [lockedPayment.user_id, now],
      );
      const existing = existingResult.rows[0];
      let subscriptionId: string;

      if (existing?.plan_id === planId) {
        subscriptionId = existing.id;
        await txQuery(
          'UPDATE subscriptions SET expires_at = $1, payment_id = $2 WHERE id = $3',
          [Math.max(Number(existing.expires_at), now) + durationMs, paymentId, existing.id],
        );
      } else {
        if (existing) {
          await txQuery(
            "UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active'",
            [lockedPayment.user_id],
          );
        }
        subscriptionId = randomUUID();
        await txQuery(
          `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
           VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
          [subscriptionId, lockedPayment.user_id, planId, now, now + durationMs, paymentId],
        );
      }

      await txQuery(
        `INSERT INTO payment_fulfillments
           (payment_id, subscription_id, fulfillment_type, fulfilled_at, metadata)
         VALUES ($1, $2, 'subscription', $3, $4)`,
        [
          paymentId,
          subscriptionId,
          now,
          JSON.stringify({ planId, periodDays, source: 'internal-webhook' }),
        ],
      );
      return 'completed' as const;
    });

    if (outcome === 'not_found') {
      return NextResponse.json({ ok: false, error: 'Payment not found' }, { status: 404 });
    }
    if (outcome === 'invalid_state' || outcome === 'missing_ledger') {
      return NextResponse.json(
        { ok: false, error: 'Payment requires reconciliation' },
        { status: 409 },
      );
    }

    logger.info('Internal webhook payment completed', {
      paymentId,
      userId: payment.userId,
      transactionId: validIdentifier(transactionId) ? transactionId : undefined,
      outcome,
    });
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    logger.error('Webhook processing failed', {
      error: error instanceof Error ? error.message : String(error),
      paymentId,
    });
    return NextResponse.json({ ok: false, error: 'Processing failed' }, { status: 500 });
  }
}
