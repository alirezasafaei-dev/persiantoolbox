import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { createPaymentCheckout } from '@/lib/payments/payment-integration';
import { resolvePaymentsCallbackUrl } from '@/lib/payments/payment-urls';
import { getUserFromRequest } from '@/lib/server/auth';
import { isSameOrigin } from '@/lib/server/csrf';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('checkout')) {
    return disabledApiResponse('checkout');
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
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

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'مبلغ پرداخت نامعتبر است.' }, { status: 400 });
  }

  const validMethods = ['zarinpal', 'idpay', 'nextpay', 'wallet'];
  if (!validMethods.includes(method)) {
    return NextResponse.json({ ok: false, error: 'روش پرداخت نامعتبر است.' }, { status: 400 });
  }

  try {
    const callbackUrl = resolvePaymentsCallbackUrl();

    const { payment, checkoutUrl } = await createPaymentCheckout(
      user.id,
      amount,
      method as 'zarinpal' | 'idpay' | 'nextpay' | 'wallet',
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
    logger.error('Payment checkout error', {
      error: error instanceof Error ? error.message : String(error),
      userId: user.id,
      amount,
      method,
    });
    return NextResponse.json({ ok: false, error: 'خطا در ایجاد درخواست پرداخت.' }, { status: 500 });
  }
}
