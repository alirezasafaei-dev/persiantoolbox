import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SubscriptionPlansPage from '@/components/features/monetization/SubscriptionPlansPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('plans', {
  title: 'طرح‌های اشتراک - PersianToolbox',
});

export default function PlansRoute() {
  if (!isFeatureEnabled('plans')) {
    return <FeatureDisabledPage feature="plans" />;
  }

  return <SubscriptionPlansPage />;
}
