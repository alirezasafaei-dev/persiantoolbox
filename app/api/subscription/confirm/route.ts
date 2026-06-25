import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getUserFromRequest } from '@/lib/server/auth';
import { logger } from '@/lib/server/logger';
import {
  completePayment,
  getPaymentById,
  getPaymentByAuthority,
  verifyZarinpalPayment,
} from '@/lib/payments/payment-integration';
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

  const { paymentId, authority } = body as { paymentId?: string; authority?: string };
  if (!paymentId && !authority) {
    return NextResponse.json(
      { ok: false, errors: ['شناسه پرداخت یا Authority الزامی است.'] },
      { status: 400 },
    );
  }

  const payment = authority
    ? await getPaymentByAuthority(authority)
    : await getPaymentById(paymentId!);
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

  const gatewayAuthority =
    authority ??
    ((payment.metadata as Record<string, unknown>)?.['gatewayRef'] as string | undefined);
  if (!gatewayAuthority) {
    return NextResponse.json(
      { ok: false, errors: ['Authority پرداخت یافت نشد.'] },
      { status: 400 },
    );
  }

  try {
    const verification = await verifyZarinpalPayment(gatewayAuthority, payment.amount);
    if (!verification.success) {
      logger.warn('Zarinpal verification failed', {
        userId: user.id,
        paymentId: payment.id,
        authority: gatewayAuthority,
        error: verification.error,
      });
      return NextResponse.json(
        {
          ok: false,
          errors: ['تأیید پرداخت توسط زرین‌پال ناموفق بود.', verification.error].filter(Boolean),
        },
        { status: 402 },
      );
    }

    await completePayment(payment.id);

    const planId = (payment.metadata as Record<string, unknown>)?.['planId'] as PlanId | undefined;
    if (planId) {
      await createSubscription(user.id, planId, payment.id);
    }

    logger.info('Subscription confirmed via Zarinpal verification', {
      userId: user.id,
      paymentId: payment.id,
      planId,
      refId: verification.refId,
    });

    return NextResponse.json({ ok: true, refId: verification.refId });
  } catch (error) {
    logger.error('Subscription confirmation failed', {
      error: error instanceof Error ? error.message : String(error),
      userId: user.id,
      paymentId: payment.id,
    });
    return NextResponse.json({ ok: false, errors: ['خطا در تأیید پرداخت.'] }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  const { searchParams } = new URL(request.url);
  const authority = searchParams.get('Authority');
  const status = searchParams.get('Status');
  const paymentId = searchParams.get('id');

  if (status && status !== 'OK') {
    return NextResponse.redirect(new URL('/payments/failure?error=پرداخت لغو شد', request.url));
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL('/account?redirect=/subscription', request.url));
  }

  let payment;
  if (authority) {
    payment = await getPaymentByAuthority(authority);
  } else if (paymentId) {
    payment = await getPaymentById(paymentId);
  }

  if (!payment || payment.userId !== user.id) {
    return NextResponse.redirect(new URL('/payments/failure?error=پرداخت یافت نشد', request.url));
  }

  if (payment.status !== 'pending') {
    return NextResponse.redirect(new URL(`/payments/success?paymentId=${payment.id}`, request.url));
  }

  const gatewayAuthority =
    authority ??
    ((payment.metadata as Record<string, unknown>)?.['gatewayRef'] as string | undefined);
  if (!gatewayAuthority) {
    return NextResponse.redirect(
      new URL('/payments/failure?error=Authority پرداخت یافت نشد', request.url),
    );
  }

  try {
    const verification = await verifyZarinpalPayment(gatewayAuthority, payment.amount);
    if (!verification.success) {
      logger.warn('Zarinpal verification failed (GET callback)', {
        userId: user.id,
        paymentId: payment.id,
        authority: gatewayAuthority,
        error: verification.error,
      });
      return NextResponse.redirect(
        new URL('/payments/failure?error=تأیید پرداخت ناموفق', request.url),
      );
    }

    await completePayment(payment.id);

    const planId = (payment.metadata as Record<string, unknown>)?.['planId'] as PlanId | undefined;
    if (planId) {
      await createSubscription(user.id, planId, payment.id);
    }

    logger.info('Subscription confirmed via GET callback + Zarinpal verification', {
      userId: user.id,
      paymentId: payment.id,
      planId,
      refId: verification.refId,
    });

    return NextResponse.redirect(new URL(`/payments/success?paymentId=${payment.id}`, request.url));
  } catch (error) {
    logger.error('GET confirm failed', {
      error: error instanceof Error ? error.message : String(error),
      paymentId: payment.id,
    });
    return NextResponse.redirect(
      new URL('/payments/failure?error=خطا در تأیید پرداخت', request.url),
    );
  }
}
