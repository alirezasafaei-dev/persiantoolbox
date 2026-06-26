import PricingContent from '@/components/features/pricing/PricingContent';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'قیمت‌گذاری — PersianToolbox',
  description: 'مقایسه پلن‌های رایگان و حرفه‌ای PersianToolbox. جدول مقایسه امکانات و قیمت‌ها.',
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
