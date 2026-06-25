import { headers } from 'next/headers';
import { getUserFromRequest } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';
import PremiumPageClient from './PremiumPageClient';
import { siteUrl, buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'اشتراک پریمیوم | PersianToolbox',
  description:
    'با اشتراک پریمیوم PersianToolbox از امکانات حرفه‌ای شامل داشبورد مالی، تولید گزارش و فاکتور استفاده کنید.',
  path: '/premium',
  keywords: ['پریمیوم', 'اشتراک فارسی', 'داشبورد مالی', 'تولید گزارش'],
});

export default async function PremiumPage() {
  const headersList = await headers();
  const request = new Request(`${siteUrl}/premium`, {
    headers: headersList,
  });
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    redirect('/account?redirect=/premium');
  }

  return <PremiumPageClient plans={SUBSCRIPTION_PLANS} />;
}
