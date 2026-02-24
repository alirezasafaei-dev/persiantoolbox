import PrivacyPolicyPage from '@/components/features/monetization/PrivacyPolicyPage';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'سیاست حریم خصوصی - جعبه ابزار فارسی',
  description: 'شفافیت کامل درباره داده‌ها، تاریخچه و حریم خصوصی کاربران Persian Tools.',
  path: '/privacy',
});

export default function PrivacyRoute() {
  return (
    <SiteShell containerClassName="py-10">
      <PrivacyPolicyPage />
    </SiteShell>
  );
}
