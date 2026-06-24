import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteSettingsAdminPage from '@/components/features/monetization/SiteSettingsAdminPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('admin-site-settings', {
  title: 'ادمین تنظیمات سایت - جعبه ابزار فارسی',
  description: 'مدیریت تنظیمات کلی سایت، SEO، شبکه‌های اجتماعی و کلیدهای API در پنل مدیریت.',
});

export default async function AdminSiteSettingsRoute() {
  if (!isFeatureEnabled('admin-site-settings')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="admin-site-settings" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <SiteSettingsAdminPage />
    </SiteShell>
  );
}
