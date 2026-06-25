import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SubscriptionPlansPage from '@/components/features/monetization/SubscriptionPlansPage';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';
import { siteUrl } from '@/lib/seo';
import Script from 'next/script';

export const metadata = featurePageMetadata('plans', {
  title: 'طرح‌های اشتراک - جعبه ابزار فارسی',
  description:
    'طرح‌های اشتراک رایگان و پریمیوم جعبه ابزار فارسی. دسترسی به ابزارهای پیشرفته و امکانات ویژه.',
});

export default function PlansRoute() {
  if (!isFeatureEnabled('plans')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="plans" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Script
        id="plans-product-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'PersianToolbox Pro',
            description: 'اشتراک پریمیوم جعبه ابزار فارسی - دسترسی نامحدود به تمام ابزارها',
            brand: { '@type': 'Brand', name: 'جعبه ابزار فارسی' },
            offers: [
              {
                '@type': 'Offer',
                name: 'پایه ماهانه',
                price: '99000',
                priceCurrency: 'IRR',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                description: 'دسترسی ماهانه به ابزارهای پریمیوم',
              },
              {
                '@type': 'Offer',
                name: 'پایه سالانه',
                price: '890000',
                priceCurrency: 'IRR',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                description: 'دسترسی سالانه - صرفه‌جویی ۲۵٪',
              },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'اشتراک‌ها', url: `${siteUrl}/plans` },
        ]}
      />
      <SubscriptionPlansPage />
    </SiteShell>
  );
}
