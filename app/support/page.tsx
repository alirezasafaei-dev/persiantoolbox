import SupportPage from '@/components/features/monetization/SupportPage';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'پشتیبانی - جعبه ابزار فارسی',
  description: 'تماس با ما، راهنمای استفاده و سؤالات متداول جعبه ابزار فارسی.',
  path: '/support',
  keywords: ['پشتیبانی', 'تماس', 'سؤالات متداول', 'راهنما'],
});

export default function SupportRoute() {
  return (
    <SiteShell containerClassName="py-10">
      <SupportPage />
    </SiteShell>
  );
}
