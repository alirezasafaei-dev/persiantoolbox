import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { isSameOrigin } from '@/lib/server/csrf';
import { getUserFromRequest } from '@/lib/server/auth';
import { signExportToken, createExportTokenPayload } from '@/lib/server/export-token';
import {
  checkCredits,
  reserveCredit,
  confirmExport,
  cancelReservation,
} from '@/lib/server/credit-metering';
import { logger } from '@/lib/server/logger';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PRODUCTS = ['business', 'career', 'writing'] as const;

export async function POST(request: Request) {
  if (!isFeatureEnabled('checkout')) {
    return disabledApiResponse('checkout');
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
  }

  const rateLimitKey = makeRateLimitKey('export:token', request);
  const rateLimitResult = await rateLimit(rateLimitKey, { limit: 10, windowMs: 60_000 });
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { ok: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        },
      },
    );
  }

  const user = await getUserFromRequest(request);
  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: 'برای دریافت خروجی حرفه‌ای باید وارد شوید.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
  }

  const { product } = body as { product?: string };

  if (!product || !(VALID_PRODUCTS as readonly string[]).includes(product)) {
    return NextResponse.json({ ok: false, error: 'محصول نامعتبر است.' }, { status: 400 });
  }

  const creditCheck = await checkCredits(user.id, product);

  if (!creditCheck.allowed) {
    logger.info('Export denied: credits exhausted', {
      userId: user.id,
      product,
      monthlyUsed: creditCheck.monthlyUsed,
      monthlyLimit: creditCheck.monthlyLimit,
    });

    return NextResponse.json({
      ok: false,
      error: creditCheck.error,
      creditsRemaining: 0,
      upgradeUrl: creditCheck.upgradeUrl ?? '/pricing',
      topUpUrl: '/pricing',
    });
  }

  if (creditCheck.retryToken) {
    const payload = createExportTokenPayload(user.id, product as (typeof VALID_PRODUCTS)[number]);
    const token = signExportToken(payload);

    logger.info('Export token issued (retry window)', {
      userId: user.id,
      product,
      retryTxId: creditCheck.retryToken,
    });

    return NextResponse.json({
      ok: true,
      token,
      expiresAt: new Date(payload.expiresAt).toISOString(),
      creditsRemaining: creditCheck.creditsRemaining,
      retry: true,
    });
  }

  const reservation = await reserveCredit(user.id, product);

  const payload = createExportTokenPayload(user.id, product as (typeof VALID_PRODUCTS)[number]);
  const token = signExportToken(payload);

  logger.info('Export token issued (credit reserved)', {
    userId: user.id,
    product,
    reservationId: reservation.reservationId,
    creditsRemaining: reservation.creditsRemaining,
  });

  return NextResponse.json({
    ok: true,
    token,
    expiresAt: new Date(payload.expiresAt).toISOString(),
    creditsRemaining: reservation.creditsRemaining,
    reservationId: reservation.reservationId,
  });
}

export async function PATCH(request: Request) {
  if (!isFeatureEnabled('checkout')) {
    return disabledApiResponse('checkout');
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
  }

  const { reservationId, action } = body as { reservationId?: string; action?: string };

  if (!reservationId || !action) {
    return NextResponse.json(
      { ok: false, error: 'فیلدهای الزامی وارد نشده‌اند.' },
      { status: 400 },
    );
  }

  if (action === 'confirm') {
    await confirmExport(reservationId);
    return NextResponse.json({ ok: true });
  }

  if (action === 'cancel') {
    await cancelReservation(reservationId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: 'عملیات نامعتبر است.' }, { status: 400 });
}
