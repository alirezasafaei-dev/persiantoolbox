import PricingContent from '@/components/features/pricing/PricingContent';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'قیمت‌گذاری و طرح‌ها - جعبه ابزار فارسی',
  description:
    'مقایسه طرح‌های رایگان و حرفه‌ای جعبه ابزار فارسی. ابزارهای پایه رایگان، امکانات حرفه‌ای با اشتراک.',
  path: '/pricing',
});

export default function PricingRoute() {
  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'قیمت‌گذاری', url: `${siteUrl}/pricing` },
        ]}
      />
      <PricingContent />
    </SiteShell>
  );
}
