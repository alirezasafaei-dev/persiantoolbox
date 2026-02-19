import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SubscriptionPublicRoadmapPage from '@/components/features/monetization/SubscriptionPublicRoadmapPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('subscription-roadmap', {
  title: 'نقشه راه اشتراک - PersianToolbox',
});

export default function SubscriptionRoadmapRoute() {
  if (!isFeatureEnabled('subscription-roadmap')) {
    return <FeatureDisabledPage feature="subscription-roadmap" />;
  }

  return <SubscriptionPublicRoadmapPage />;
}
