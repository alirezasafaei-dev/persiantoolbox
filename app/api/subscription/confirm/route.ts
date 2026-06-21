import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getUserFromRequest } from '@/lib/server/auth';
import { logger } from '@/lib/server/logger';
import { completePayment, getPaymentById } from '@/lib/payments/payment-integration';
import { createSubscription } from '@/lib/subscriptions/subscription-manager';
import { type PlanId } from '@/lib/subscriptionPlans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { ok: false, errors: ['برای تأیید پرداخت باید وارد شوید.'] },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  const { paymentId } = body as { paymentId?: string };
  if (!paymentId) {
    return NextResponse.json({ ok: false, errors: ['شناسه پرداخت الزامی است.'] }, { status: 400 });
  }

  const payment = await getPaymentById(paymentId);
  if (!payment) {
    return NextResponse.json({ ok: false, errors: ['پرداخت یافت نشد.'] }, { status: 404 });
  }

  if (payment.userId !== user.id) {
    return NextResponse.json({ ok: false, errors: ['دسترسی غیرمجاز.'] }, { status: 403 });
  }

  if (payment.status !== 'pending') {
    return NextResponse.json(
      { ok: false, errors: ['این پرداخت قبلاً پردازش شده است.'] },
      { status: 409 },
    );
  }

  try {
    await completePayment(paymentId);

    const planId = (payment.metadata as Record<string, unknown>)?.['planId'] as PlanId | undefined;
    if (planId) {
      await createSubscription(user.id, planId, paymentId);
    }

    logger.info('Subscription confirmed', {
      userId: user.id,
      paymentId,
      planId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Subscription confirmation failed', {
      error: error instanceof Error ? error.message : String(error),
      userId: user.id,
      paymentId,
    });
    return NextResponse.json({ ok: false, errors: ['خطا در تأیید پرداخت.'] }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL('/account?redirect=/subscription', request.url));
  }

  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('id');

  if (!paymentId) {
    return NextResponse.redirect(new URL('/subscription', request.url));
  }

  const payment = await getPaymentById(paymentId);
  if (!payment || payment.userId !== user.id) {
    return NextResponse.redirect(new URL('/subscription', request.url));
  }

  if (payment.status !== 'pending') {
    return NextResponse.redirect(new URL('/subscription', request.url));
  }

  try {
    await completePayment(paymentId);

    const planId = (payment.metadata as Record<string, unknown>)?.['planId'] as PlanId | undefined;
    if (planId) {
      await createSubscription(user.id, planId, paymentId);
    }

    logger.info('Subscription confirmed via GET callback', {
      userId: user.id,
      paymentId,
      planId,
    });
  } catch (error) {
    logger.error('GET confirm failed', {
      error: error instanceof Error ? error.message : String(error),
      paymentId,
    });
  }

  return NextResponse.redirect(new URL('/subscription', request.url));
}
