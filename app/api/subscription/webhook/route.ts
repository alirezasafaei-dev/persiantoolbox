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
  // No process-local replay cache: payment row locking and state transitions are authoritative.
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

export async function POST(request: Request) {
  if (!isFeatureEnabled('subscription')) return disabledApiResponse('subscription');

  // Zarinpal payments must always pass through provider verification. This
  // internal webhook is opt-in and cannot silently become an alternate success path.
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
      if (lockedPayment.status === 'completed') return 'already_processed' as const;
      if (lockedPayment.status !== 'pending') return 'invalid_state' as const;

      const refId = validIdentifier(transactionId) ? transactionId : null;
      await txQuery(
        `UPDATE payments
         SET status = 'completed', completed_at = $1, gateway_ref_id = COALESCE(gateway_ref_id, $2),
             failure_code = NULL, failure_message = NULL
         WHERE id = $3 AND status = 'pending'`,
        [Date.now(), refId, paymentId],
      );

      let metadata: Record<string, unknown> | undefined;
      if (typeof lockedPayment.metadata === 'string') {
        try {
          metadata = JSON.parse(lockedPayment.metadata) as Record<string, unknown>;
        } catch {
          metadata = undefined;
        }
      } else {
        metadata = lockedPayment.metadata ?? undefined;
      }

      const planId = typeof metadata?.['planId'] === 'string' ? metadata['planId'] : undefined;
      if (!planId) return 'completed' as const;

      const alreadyFulfilled = await txQuery<{ id: string }>(
        'SELECT id FROM subscriptions WHERE payment_id = $1 LIMIT 1',
        [paymentId],
      );
      if (alreadyFulfilled.rows.length > 0) return 'already_processed' as const;

      const rawPeriodDays = Number(metadata?.['periodDays'] ?? 30);
      const periodDays =
        Number.isSafeInteger(rawPeriodDays) && rawPeriodDays > 0 && rawPeriodDays <= 366
          ? rawPeriodDays
          : 30;
      const now = Date.now();
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

      if (existing?.plan_id === planId) {
        await txQuery(
          'UPDATE subscriptions SET expires_at = $1, payment_id = $2 WHERE id = $3',
          [Math.max(Number(existing.expires_at), now) + durationMs, paymentId, existing.id],
        );
        return 'completed' as const;
      }

      if (existing) {
        await txQuery(
          "UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active'",
          [lockedPayment.user_id],
        );
      }
      await txQuery(
        `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
         VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
        [randomUUID(), lockedPayment.user_id, planId, now, now + durationMs, paymentId],
      );
      return 'completed' as const;
    });

    if (outcome === 'not_found') {
      return NextResponse.json({ ok: false, error: 'Payment not found' }, { status: 404 });
    }
    if (outcome === 'invalid_state') {
      return NextResponse.json({ ok: false, error: 'Payment state conflict' }, { status: 409 });
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
