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

export async function POST(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  let body: unknown;
  try {
    body = await request.json();
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

  const payment = getPaymentById(paymentId);
  if (!payment) {
    logger.warn('Webhook received for unknown payment', { paymentId });
    return NextResponse.json({ ok: false, error: 'Payment not found' }, { status: 404 });
  }

  if (payment.status !== 'pending') {
    return NextResponse.json({ ok: true, message: 'Already processed' });
  }

  try {
    if (status === 'completed' || status === 'success') {
      completePayment(paymentId);

      const planId = (payment.metadata as Record<string, unknown>)?.['planId'] as
        | PlanId
        | undefined;
      if (planId) {
        createSubscription(payment.userId, planId, paymentId);
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
