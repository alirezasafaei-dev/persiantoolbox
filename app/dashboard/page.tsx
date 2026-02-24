import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('dashboard', {
  title: 'داشبورد - جعبه ابزار فارسی',
});

export default function UsageDashboardRoute() {
  if (!isFeatureEnabled('dashboard')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="dashboard" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <FeatureDisabledPage feature="dashboard" />
    </SiteShell>
  );
}
