import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SubscriptionPublicRoadmapPage from '@/components/features/monetization/SubscriptionPublicRoadmapPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('subscription-roadmap', {
  title: 'نقشه راه اشتراک - جعبه ابزار فارسی',
});

export default function SubscriptionRoadmapRoute() {
  if (!isFeatureEnabled('subscription-roadmap')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="subscription-roadmap" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <SubscriptionPublicRoadmapPage />
    </SiteShell>
  );
}
