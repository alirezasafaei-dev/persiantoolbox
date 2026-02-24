import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteShell from '@/components/ui/SiteShell';
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

  return (
    <SiteShell>
      <FeatureDisabledPage feature="admin-monetization" />
    </SiteShell>
  );
}
