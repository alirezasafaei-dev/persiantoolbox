import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('dashboard', {
  title: 'داشبورد - PersianToolbox',
});

export default function UsageDashboardRoute() {
  if (!isFeatureEnabled('dashboard')) {
    return <FeatureDisabledPage feature="dashboard" />;
  }

  return <FeatureDisabledPage feature="dashboard" />;
}
