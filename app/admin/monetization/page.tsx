import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('admin-monetization', {
  title: 'ادمین درآمدزایی - PersianToolbox',
});

export default async function MonetizationAdminRoute() {
  if (!isFeatureEnabled('admin-monetization')) {
    return <FeatureDisabledPage feature="admin-monetization" />;
  }

  return <FeatureDisabledPage feature="admin-monetization" />;
}
