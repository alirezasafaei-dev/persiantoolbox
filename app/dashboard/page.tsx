import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';
import OpsDashboardClient from '@/components/features/admin/OpsDashboardClient';

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
      <OpsDashboardClient />
    </SiteShell>
  );
}
