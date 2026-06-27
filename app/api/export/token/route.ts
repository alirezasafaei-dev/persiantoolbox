import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { isSameOrigin } from '@/lib/server/csrf';
import { getUserFromRequest } from '@/lib/server/auth';
import { getActiveSubscription } from '@/lib/subscriptions/subscription-manager';
import { signExportToken, createExportTokenPayload } from '@/lib/server/export-token';
import { logger } from '@/lib/server/logger';

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

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return NextResponse.json({
      ok: false,
      error: 'اشتراک فعال نیست.',
      upgradeUrl: '/pricing',
    });
  }

  const payload = createExportTokenPayload(user.id, product as (typeof VALID_PRODUCTS)[number]);
  const token = signExportToken(payload);

  logger.info(`Export token issued for ${product}`, { userId: user.id, product });

  return NextResponse.json({
    ok: true,
    token,
    expiresAt: new Date(payload.expiresAt).toISOString(),
  });
}
