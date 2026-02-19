import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import { featurePageMetadata, getFeatureInfo } from '@/lib/features/availability';

export const metadata = featurePageMetadata('checkout', {
  title: 'پرداخت - PersianToolbox',
});

export default function CheckoutPage() {
  const feature = getFeatureInfo('checkout');
  if (!feature.enabled) {
    return <FeatureDisabledPage feature="checkout" />;
  }

  return <FeatureDisabledPage feature="checkout" />;
}
