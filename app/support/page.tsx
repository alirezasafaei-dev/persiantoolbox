import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SupportPage from '@/components/features/monetization/SupportPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('support', {
  title: 'حمایت از PersianToolbox',
  robots: { index: false, follow: false },
});

export default function SupportRoute() {
  if (!isFeatureEnabled('support')) {
    return <FeatureDisabledPage feature="support" />;
  }

  return <SupportPage />;
}
