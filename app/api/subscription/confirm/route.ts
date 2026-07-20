import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getUserFromRequest } from '@/lib/server/auth';
import { logger } from '@/lib/server/logger';
import { verifyPaymentCallback } from '@/lib/payments/payment-integration';

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

  const gatewayAuthority =
    authority ?? ((body as Record<string, unknown>)?.['gatewayRef'] as string | undefined);
  if (!gatewayAuthority) {
    return NextResponse.json(
      { ok: false, errors: ['Authority پرداخت یافت نشد.'] },
      { status: 400 },
    );
  }

  // Delegate to the transactional callback verifier.
  // verifyPaymentCallback handles: locking, verification, completion,
  // and subscription creation — all in one DB transaction.
  const result = await verifyPaymentCallback(gatewayAuthority, {
    Authority: gatewayAuthority,
    Status: 'OK',
  });

  if (!result.success) {
    logger.warn('Subscription confirmation failed', {
      userId: user.id,
      paymentId,
      authority: gatewayAuthority,
      error: result.error,
    });
    const status =
      result.error === 'Payment not found'
        ? 404
        : result.error?.startsWith('Payment is')
          ? 409
          : 402;
    return NextResponse.json(
      { ok: false, errors: ['تأیید پرداخت ناموفق بود.', result.error].filter(Boolean) },
      { status },
    );
  }

  logger.info('Subscription confirmed via transactional callback', {
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

  if (!authority) {
    return NextResponse.redirect(
      new URL('/payments/failure?error=Authority پرداخت یافت نشد', request.url),
    );
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

  logger.info('Subscription confirmed via GET callback', {
    userId: user.id,
    paymentId: result.payment?.id,
  });

  return NextResponse.redirect(
    new URL(`/payments/success?paymentId=${result.payment?.id}`, request.url),
  );
}
