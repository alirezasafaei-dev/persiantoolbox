import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getUserFromRequest } from '@/lib/server/auth';
import { isSameOrigin } from '@/lib/server/csrf';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Generic client-priced checkout is intentionally disabled.
 *
 * Every revenue route must resolve its product and price from a server-owned
 * catalog. Subscription purchases use /api/subscription/checkout. Future
 * one-time products must add a productId-based server catalog before enabling
 * this endpoint again.
 */
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

  logger.warn('Blocked generic client-priced checkout', { userId: user.id });
  return NextResponse.json(
    {
      ok: false,
      error: 'این مسیر پرداخت غیرفعال است. خرید باید از مسیر محصول با قیمت سمت سرور انجام شود.',
      code: 'SERVER_PRICED_CHECKOUT_REQUIRED',
    },
    { status: 410 },
  );
}
