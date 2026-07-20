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
  // no-op: used for test isolation
}

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const provided = Buffer.from(signature, 'hex');
  const expected = Buffer.from(createHmac('sha256', secret).update(payload).digest('hex'), 'hex');
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  const rawBody = await request.text();

  const webhookSecret = process.env['PAYMENT_WEBHOOK_SECRET'];
  if (!webhookSecret) {
    logger.error('PAYMENT_WEBHOOK_SECRET is not configured — rejecting webhook');
    return NextResponse.json(
      { ok: false, error: 'Webhook secret not configured' },
      { status: 503 },
    );
  }

  const signature =
    request.headers.get('x-webhook-signature') ?? request.headers.get('x-signature');
  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    logger.warn('Webhook signature verification failed');
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { paymentId, status, transactionId } = body as {
    paymentId?: string;
    status?: string;
    transactionId?: string;
  };

  if (!paymentId) {
    return NextResponse.json({ ok: false, error: 'paymentId is required' }, { status: 400 });
  }

  const payment = await getPaymentById(paymentId);
  if (!payment) {
    logger.warn('Webhook received for unknown payment', { paymentId });
    return NextResponse.json({ ok: false, error: 'Payment not found' }, { status: 404 });
  }

  if (payment.status !== 'pending') {
    return NextResponse.json({ ok: true, message: 'Already processed' });
  }

  try {
    if (status === 'completed' || status === 'success') {
      // Transactional: complete payment + create subscription atomically
      await withTransaction(async (txQuery) => {
        const now = Date.now();
        const completeResult = await txQuery(
          `UPDATE payments SET status = 'completed', completed_at = $1, gateway_ref_id = COALESCE($2, gateway_ref_id)
           WHERE id = $3 AND status = 'pending'`,
          [now, transactionId ?? null, paymentId],
        );

        if (completeResult.rowCount === 0) {
          throw new Error('Payment already processed or not found');
        }

        const meta = payment.metadata as Record<string, unknown> | undefined;
        const planId = meta?.['planId'] as string | undefined;
        if (planId) {
          const subId = `sub_${randomUUID()}`;
          const durationMs = 30 * 24 * 60 * 60 * 1000;
          const endDate = now + durationMs;

          // Check for existing active subscription to extend
          const existingResult = await txQuery<{ id: string; plan_id: string; expires_at: number }>(
            `SELECT id, plan_id, expires_at FROM subscriptions
             WHERE user_id = $1 AND status = 'active' AND expires_at > $2
             ORDER BY expires_at DESC LIMIT 1`,
            [payment.userId, now],
          );

          if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0]!;
            if (existing.plan_id === planId) {
              await txQuery(
                'UPDATE subscriptions SET expires_at = $1, payment_id = $2 WHERE id = $3',
                [existing.expires_at + durationMs, paymentId, existing.id],
              );
            } else {
              await txQuery(
                "UPDATE subscriptions SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'",
                [payment.userId],
              );
              await txQuery(
                `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
                 VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
                [subId, payment.userId, planId, now, endDate, paymentId],
              );
            }
          } else {
            await txQuery(
              `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
               VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
              [subId, payment.userId, planId, now, endDate, paymentId],
            );
          }
        }
      });

      logger.info('Webhook payment completed (transactional)', {
        paymentId,
        userId: payment.userId,
        transactionId,
      });
    } else {
      logger.info('Webhook payment not successful', {
        paymentId,
        status,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Webhook processing failed', {
      error: error instanceof Error ? error.message : String(error),
      paymentId,
    });
    return NextResponse.json({ ok: false, error: 'Processing failed' }, { status: 500 });
  }
}
