import { Suspense } from 'react';
import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';
import { getAnalyticsSummary } from '@/lib/analyticsStore';
import MonetizationAdminPage from '@/components/features/monetization/MonetizationAdminPage';

export const metadata = featurePageMetadata('admin-monetization', {
  title: 'ادمین درآمدزایی - جعبه ابزار فارسی',
});

async function fetchMonetizationData() {
  try {
    const summary = await getAnalyticsSummary();
    return { summary };
  } catch {
    return { summary: null };
  }
}

export default async function MonetizationAdminRoute() {
  if (!isFeatureEnabled('admin-monetization')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="admin-monetization" />
      </SiteShell>
    );
  }

  const { summary } = await fetchMonetizationData();

  return (
    <SiteShell>
      <Suspense fallback={<div className="p-6">در حال بارگذاری...</div>}>
        <MonetizationAdminPage
          initialSummary={
            summary ?? {
              totalEvents: 0,
              eventCounts: {},
              pathCounts: {},
              lastUpdated: null,
              version: 1,
            }
          }
        />
      </Suspense>
    </SiteShell>
  );
}
