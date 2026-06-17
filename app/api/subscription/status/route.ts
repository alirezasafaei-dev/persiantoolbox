import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getUserFromRequest } from '@/lib/server/auth';
import { getActiveSubscription } from '@/lib/subscriptions/subscription-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { ok: false, errors: ['برای مشاهده وضعیت اشتراک باید وارد شوید.'] },
      { status: 401 },
    );
  }

  const subscription = getActiveSubscription(user.id);

  if (!subscription) {
    return NextResponse.json({ ok: true, subscription: null });
  }

  return NextResponse.json({
    ok: true,
    subscription: {
      id: subscription.id,
      planId: subscription.planId,
      status: subscription.status,
      startedAt: new Date(subscription.startDate).getTime(),
      expiresAt: new Date(subscription.endDate).getTime(),
    },
  });
}
