import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SubscriptionPlansPage from '@/components/features/monetization/SubscriptionPlansPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('plans', {
  title: 'طرح‌های اشتراک - جعبه ابزار فارسی',
});

export default function PlansRoute() {
  if (!isFeatureEnabled('plans')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="plans" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <SubscriptionPlansPage />
    </SiteShell>
  );
}
