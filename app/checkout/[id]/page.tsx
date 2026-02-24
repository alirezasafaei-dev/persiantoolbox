import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, getFeatureInfo } from '@/lib/features/availability';

export const metadata = featurePageMetadata('checkout', {
  title: 'پرداخت - جعبه ابزار فارسی',
});

export default function CheckoutPage() {
  const feature = getFeatureInfo('checkout');
  if (!feature.enabled) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="checkout" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <FeatureDisabledPage feature="checkout" />
    </SiteShell>
  );
}
