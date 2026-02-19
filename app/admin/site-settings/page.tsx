import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteSettingsAdminPage from '@/components/features/monetization/SiteSettingsAdminPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('admin-site-settings', {
  title: 'ادمین تنظیمات سایت - PersianToolbox',
});

export default async function AdminSiteSettingsRoute() {
  if (!isFeatureEnabled('admin-site-settings')) {
    return <FeatureDisabledPage feature="admin-site-settings" />;
  }

  return <SiteSettingsAdminPage />;
}
