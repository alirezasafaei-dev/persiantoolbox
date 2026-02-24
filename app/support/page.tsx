import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SupportPage from '@/components/features/monetization/SupportPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('support', {
  title: 'حمایت از جعبه ابزار فارسی',
  robots: { index: false, follow: false },
});

export default function SupportRoute() {
  if (!isFeatureEnabled('support')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="support" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <SupportPage />
    </SiteShell>
  );
}
