import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import AdsTransparencyPage from '@/components/features/monetization/AdsTransparencyPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('ads', {
  title: 'شفافیت تبلیغات - PersianToolbox',
});

export default function AdsTransparencyRoute() {
  if (!isFeatureEnabled('ads')) {
    return <FeatureDisabledPage feature="ads" />;
  }

  return <AdsTransparencyPage />;
}
