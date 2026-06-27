import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { isSameOrigin } from '@/lib/server/csrf';
import { getUserFromRequest } from '@/lib/server/auth';
import { getCreditBalance } from '@/lib/server/credit-metering';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isFeatureEnabled('checkout')) {
    return disabledApiResponse('checkout');
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
  }

  const user = await getUserFromRequest(request);
  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: 'برای مشاهده اعتبار باید وارد شوید.' },
      { status: 401 },
    );
  }

  const balance = await getCreditBalance(user.id);

  return NextResponse.json({
    ok: true,
    ...balance,
    creditsRemaining: Math.max(0, balance.monthlyLimit - balance.monthlyUsed),
  });
}
