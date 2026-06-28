import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getActiveSubscription } from '@/lib/subscriptions/subscription-manager';
import { getDailyUsage } from '@/lib/server/entitlements';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { ok: false, error: 'برای مشاهده وضعیت اشتراک باید وارد شوید.' },
        { status: 401 },
      );
    }

    const subscription = await getActiveSubscription(user.id);
    const usage = await getDailyUsage(user.id);

    let planInfo = null;
    if (subscription) {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId);
      planInfo = {
        id: subscription.planId,
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
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'خطا در دریافت وضعیت اشتراک.' },
      { status: 500 },
    );
  }
}
