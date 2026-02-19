import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import DevelopersPage from '@/components/features/developers/DevelopersPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('developers', {
  title: 'راهنمای توسعه‌دهندگان - PersianToolbox',
});

export default function DevelopersRoute() {
  if (!isFeatureEnabled('developers')) {
    return <FeatureDisabledPage feature="developers" />;
  }

  return <DevelopersPage />;
}
