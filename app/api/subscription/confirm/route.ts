import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getUserFromRequest } from '@/lib/server/auth';
import { isSameOrigin } from '@/lib/server/csrf';
import { logger } from '@/lib/server/logger';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { getPaymentByAuthority, getPaymentById } from '@/lib/payments/payment-integration';
import { verifyPaymentCallback } from '@/lib/payments/payment-verification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function validReference(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128;
}

function confirmationStatus(error: string | undefined): number {
  if (error === 'Payment not found') {
    return 404;
  }
  if (error?.startsWith('Payment is')) {
    return 409;
  }
  return 402;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, errors: ['CSRF validation failed.'] }, { status: 403 });
  }

  const rateLimitKey = makeRateLimitKey('subscription:confirm', request);
  const rateLimitResult = await rateLimit(rateLimitKey, { limit: 10, windowMs: 60_000 });
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { ok: false, errors: ['تعداد درخواست‌ها بیش از حد مجاز است.'] },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

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

  const values = body as Record<string, unknown>;
  const paymentId = values['paymentId'];
  const authority = values['authority'];
  if (!validReference(paymentId) && !validReference(authority)) {
    return NextResponse.json(
      { ok: false, errors: ['شناسه پرداخت یا Authority معتبر الزامی است.'] },
      { status: 400 },
    );
  }

  const payment = validReference(authority)
    ? await getPaymentByAuthority(authority)
    : await getPaymentById(paymentId as string);
  if (!payment) {
    return NextResponse.json({ ok: false, errors: ['پرداخت یافت نشد.'] }, { status: 404 });
  }
  if (payment.userId !== user.id) {
    logger.warn('Subscription confirmation ownership mismatch', {
      userId: user.id,
      paymentId: payment.id,
    });
    return NextResponse.json({ ok: false, errors: ['دسترسی غیرمجاز.'] }, { status: 403 });
  }

  const gatewayAuthority = validReference(authority) ? authority : payment.gatewayAuthority;
  if (!validReference(gatewayAuthority)) {
    return NextResponse.json(
      { ok: false, errors: ['Authority پرداخت یافت نشد.'] },
      { status: 400 },
    );
  }

  const result = await verifyPaymentCallback(gatewayAuthority, {
    Authority: gatewayAuthority,
    Status: 'OK',
  });

  if (!result.success) {
    logger.warn('Subscription confirmation failed', {
      userId: user.id,
      paymentId: payment.id,
      authority: gatewayAuthority,
      error: result.error,
    });
    return NextResponse.json(
      { ok: false, errors: ['تأیید پرداخت ناموفق بود.'] },
      { status: confirmationStatus(result.error) },
    );
  }

  logger.info('Subscription confirmed via lock-safe callback', {
    userId: user.id,
    paymentId: result.payment?.id,
  });
  return NextResponse.json({ ok: true, refId: result.payment?.gatewayRefId });
}

export async function GET(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  const { searchParams } = new URL(request.url);
  const authority = searchParams.get('Authority');
  const status = searchParams.get('Status');

  if (status && status !== 'OK') {
    return NextResponse.redirect(new URL('/payments/failure?error=پرداخت لغو شد', request.url));
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL('/account?redirect=/subscription', request.url));
  }

  if (!validReference(authority)) {
    return NextResponse.redirect(
      new URL('/payments/failure?error=Authority پرداخت نامعتبر است', request.url),
    );
  }

  const payment = await getPaymentByAuthority(authority);
  if (!payment || payment.userId !== user.id) {
    logger.warn('GET subscription confirmation ownership mismatch', {
      userId: user.id,
      paymentId: payment?.id,
    });
    return NextResponse.redirect(new URL('/payments/failure?error=پرداخت یافت نشد', request.url));
  }

  const result = await verifyPaymentCallback(authority, {
    Authority: authority,
    Status: status ?? 'OK',
  });

  if (!result.success) {
    logger.warn('GET subscription confirm failed', {
      userId: user.id,
      authority,
      error: result.error,
    });
    return NextResponse.redirect(
      new URL('/payments/failure?error=تأیید پرداخت ناموفق', request.url),
    );
  }

  logger.info('Subscription confirmed via lock-safe GET callback', {
    userId: user.id,
    paymentId: result.payment?.id,
  });
  return NextResponse.redirect(
    new URL(
      `/payments/success?paymentId=${encodeURIComponent(result.payment?.id ?? '')}`,
      request.url,
    ),
  );
}
