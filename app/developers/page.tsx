import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import DevelopersPage from '@/components/features/developers/DevelopersPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('developers', {
  title: 'راهنمای توسعه‌دهندگان - جعبه ابزار فارسی',
  description:
    'مستندات API و راهنمای توسعه‌دهندگان برای استفاده از سرویس‌های جعبه ابزار فارسی. ادغام ابزارها در برنامه‌های خود.',
});

export default function DevelopersRoute() {
  if (!isFeatureEnabled('developers')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="developers" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <DevelopersPage />
    </SiteShell>
  );
}
