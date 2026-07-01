import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const revalidate = 3600;

const SalonContractForm = dynamic(
  () => import('@/components/features/contract-salon/SalonContractForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'قرارداد سالن زیبایی | ساخت آنلاین قرارداد خدمات زیبایی',
  description:
    'ساخت قرارداد سالن زیبایی حرفه‌ای به صورت آنلاین. قرارداد خدمات زیبایی استاندارد و جامع با بندهای حقوقی و خروجی PDF و Word. بدون اشتراک ماهانه.',
  path: '/contract-tools/salon-contract',
  keywords: [
    'قرارداد سالن زیبایی',
    'قرارداد خدمات زیبایی',
    'قرارداد آرایشگاه',
    'قرارداد ناخن کار',
    'قرارداد شنیون کار',
  ],
});

export default function SalonContractPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="salon-contract-breadcrumb"
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
              { '@type': 'ListItem', position: 3, name: 'قرارداد سالن زیبایی' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای قرارداد', url: `${siteUrl}/contract-tools` },
          { name: 'قرارداد سالن زیبایی', url: `${siteUrl}/contract-tools/salon-contract` },
        ]}
      />
      <Script
        id="salon-contract-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا این قرارداد رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'این قرارداد یک پیش‌نویس حرفه‌ای است و جایگزین مشاوره حقوقی نیست. برای رسمی‌سازی با وکیل مشورت کنید.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات من به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود و هیچ اطلاعاتی به سرور ارسال نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'هزینه خروجی حرفه‌ای چقدر است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بسته ۳ خروجی تمیز فقط ۴۹,۰۰۰ تومان است و نیازی به اشتراک ماهانه ندارد. قرارداد سالن با ۲ اعتبار خروجی تمیز صادر می‌شود.',
                },
              },
            ],
          }),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <SalonContractForm />
      </div>
    </SiteShell>
  );
}
