import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logger } from '@/lib/server/logger';
import { completePayment, getPaymentById } from '@/lib/payments/payment-integration';
import { createSubscription } from '@/lib/subscriptions/subscription-manager';
import { type PlanId } from '@/lib/subscriptionPlans';

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
  if (!signature || !secret) {
    return false;
  }
  const crypto = require('node:crypto');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
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
      await completePayment(paymentId);

      const planId = (payment.metadata as Record<string, unknown>)?.['planId'] as
        | PlanId
        | undefined;
      if (planId) {
        await createSubscription(payment.userId, planId, paymentId);
      }

      logger.info('Webhook payment completed', {
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
