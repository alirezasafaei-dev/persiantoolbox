import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import AdsTransparencyPage from '@/components/features/monetization/AdsTransparencyPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('ads', {
  title: 'شفافیت تبلیغات - جعبه ابزار فارسی',
  description:
    'اطلاعات شفاف درباره تبلیغات نمایش داده شده در جعبه ابزار فارسی و نحوه درآمدزایی سایت.',
});

export default function AdsTransparencyRoute() {
  if (!isFeatureEnabled('ads')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="ads" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <AdsTransparencyPage />
    </SiteShell>
  );
}
