import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/server/auth';
import { getActiveSubscription } from '@/lib/subscriptions/subscription-manager';
import { getDailyUsage, FREE_DAILY_TOOL_LIMIT } from '@/lib/server/entitlements';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';
import { siteUrl, buildMetadata } from '@/lib/seo';
import SubscriptionPageClient from '@/components/features/subscription/SubscriptionPageClient';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import SiteShell from '@/components/ui/SiteShell';

export const metadata = buildMetadata({
  title: 'مدیریت اشتراک | PersianToolbox',
  description: 'وضعیت اشتراک، مصرف روزانه و گزینه‌های ارتقای خود را مشاهده کنید.',
  path: '/subscription',
  keywords: ['اشتراک', 'مدیریت اشتراک', 'پریمیوم', 'محدودیت استفاده'],
});

export default async function SubscriptionPage() {
  const headersList = await headers();
  const request = new Request(`${siteUrl}/subscription`, {
    headers: headersList,
  });
  const user = await getUserFromRequest(request);

  if (!user?.id) {
    redirect('/account?redirect=/subscription');
  }

  const subscription = await getActiveSubscription(user.id);
  const usage = await getDailyUsage(user.id);

  const planInfo = (() => {
    if (!subscription) {
      return null;
    }
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId);
    return {
      id: subscription.planId,
      title: plan?.title ?? subscription.planId,
      tier: plan?.tier ?? 'basic',
      expiresAt: subscription.endDate,
      startedAt: subscription.startDate,
    };
  })();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'مدیریت اشتراک', url: `${siteUrl}/subscription` },
        ]}
      />
      <SiteShell>
        <SubscriptionPageClient
          subscription={planInfo}
          usage={{
            used: usage.used,
            limit: usage.limit,
            isPremium: usage.isPremium,
            freeDailyLimit: FREE_DAILY_TOOL_LIMIT,
          }}
        />
      </SiteShell>
    </>
  );
}
