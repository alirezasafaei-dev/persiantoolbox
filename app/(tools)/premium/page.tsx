import { headers } from 'next/headers';
import { getUserFromRequest } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';
import PremiumPageClient from './PremiumPageClient';
import { siteUrl } from '@/lib/seo';

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
