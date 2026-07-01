import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

export const revalidate = 3600;

const VehicleSaleForm = dynamic(
  () => import('@/components/features/contract-vehicle/VehicleSaleForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'مبایعه‌نامه خودرو | ساخت آنلاین قرارداد خرید و فروش خودرو',
  description:
    'ساخت مبایعه‌نامه خودرو حرفه‌ای به صورت آنلاین. مبایعه‌نامه استاندارد و جامع با بندهای حقوقی و خروجی PDF و Word. بدون اشتراک ماهانه.',
  path: '/contract-tools/vehicle-sale',
  keywords: [
    'مبایعه‌نامه خودرو',
    'قرارداد خرید فروش خودرو',
    'قرارداد ماشین',
    'مبایعه‌نامه ماشین',
    'سند خودرو',
  ],
});

export default async function VehicleSalePage() {
  const pack3PricingFaq = await getPack3FaqAnswer(
    ' و نیازی به اشتراک ماهانه ندارد. قراردادهای حقوقی با ۲ اعتبار خروجی تمیز صادر می‌شوند.',
  );

  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="vehicle-sale-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'ابزارهای قرارداد',
                item: `${siteUrl}/contract-tools`,
              },
              { '@type': 'ListItem', position: 3, name: 'مبایعه‌نامه خودرو' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای قرارداد', url: `${siteUrl}/contract-tools` },
          { name: 'مبایعه‌نامه خودرو', url: `${siteUrl}/contract-tools/vehicle-sale` },
        ]}
      />
      <Script
        id="vehicle-sale-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا این مبایعه‌نامه رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'این مبایعه‌نامه یک پیش‌نویس حرفه‌ای است. برای انتقال سند باید به دفترخانه مراجعه کنید.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات من به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'هزینه خروجی حرفه‌ای چقدر است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: pack3PricingFaq,
                },
              },
            ],
          }),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <VehicleSaleForm />
      </div>
    </SiteShell>
  );
}
