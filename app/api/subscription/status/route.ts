import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getActiveSubscription } from '@/lib/subscriptions/subscription-manager';
import { getDailyUsage } from '@/lib/server/entitlements';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';
import { UnauthorizedError } from '@/lib/server/api-errors';
import { handleApiError } from '@/lib/server/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      throw new UnauthorizedError('برای مشاهده وضعیت اشتراک باید وارد شوید.');
    }

    const subscription = await getActiveSubscription(user.id);
    const usage = await getDailyUsage(user.id);

    let planInfo = null;
    if (subscription) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId);
      planInfo = {
        id: subscription.planId,
        planId: subscription.planId,
        active: true,
        title: plan?.title ?? subscription.planId,
        tier: plan?.tier ?? 'basic',
        expiresAt: subscription.endDate,
      };
    }

    return NextResponse.json({
      ok: true,
      subscription: planInfo,
      usage: {
        used: usage.used,
        limit: usage.limit,
        isPremium: usage.isPremium,
      },
    });
  } catch (error) {
    return handleApiError(error, '/api/subscription/status');
  }
}
