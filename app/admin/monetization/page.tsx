import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import MonetizationAdminPage from '@/components/features/monetization/MonetizationAdminPage';
import SiteShell from '@/components/ui/SiteShell';
import { getAnalyticsSummary } from '@/lib/analyticsStore';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('admin-monetization', {
  title: 'ادمین درآمدزایی - جعبه ابزار فارسی',
});

export default async function MonetizationAdminRoute() {
  if (!isFeatureEnabled('admin-monetization')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="admin-monetization" />
      </SiteShell>
    );
  }

  const initialSummary = await getAnalyticsSummary();

  return (
    <SiteShell>
      <MonetizationAdminPage initialSummary={initialSummary} />
    </SiteShell>
  );
}
