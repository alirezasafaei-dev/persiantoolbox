import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { createPaymentCheckout } from '@/lib/payments/payment-integration';
import { resolvePaymentsCallbackUrl } from '@/lib/payments/payment-urls';
import { getUserFromRequest } from '@/lib/server/auth';
import { isSameOrigin } from '@/lib/server/csrf';
import { logger } from '@/lib/server/logger';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('checkout')) {
    return disabledApiResponse('checkout');
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
  }

  const limit = await rateLimit(makeRateLimitKey('payments:checkout', request), {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'تعداد درخواست‌های پرداخت بیش از حد مجاز است.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil((limit.resetAt - Date.now()) / 1000).toString() },
      },
    );
  }

  const user = await getUserFromRequest(request);
  if (!user?.id) {
    return NextResponse.json({ ok: false, error: 'برای پرداخت باید وارد شوید.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
  }

  const { amount, method, description } = body as {
    amount?: number;
    method?: string;
    description?: string;
  };

  if (!amount || !method || !description) {
    return NextResponse.json(
      { ok: false, error: 'فیلدهای الزامی وارد نشده‌اند: مبلغ، روش پرداخت و توضیحات.' },
      { status: 400 },
    );
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'مبلغ پرداخت نامعتبر است.' }, { status: 400 });
  }

  const validMethods = ['zarinpal', 'idpay', 'nextpay', 'wallet'] as const;
  if (!validMethods.includes(method as (typeof validMethods)[number])) {
    return NextResponse.json({ ok: false, error: 'روش پرداخت نامعتبر است.' }, { status: 400 });
  }

  try {
    const callbackUrl = resolvePaymentsCallbackUrl();
    const { payment, checkoutUrl } = await createPaymentCheckout(
      user.id,
      amount,
      method as (typeof validMethods)[number],
      description,
      callbackUrl,
      { userId: user.id },
    );

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      checkoutUrl,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Payment checkout error', { error: message, userId: user.id, amount, method });
    if (message === 'PAYMENT_GATEWAY_NOT_CONFIGURED') {
      return NextResponse.json(
        { ok: false, error: 'درگاه پرداخت موقتاً آماده نیست.' },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, error: 'خطا در ایجاد درخواست پرداخت.' }, { status: 500 });
  }
}
