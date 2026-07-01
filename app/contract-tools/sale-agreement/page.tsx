import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

export const revalidate = 3600;

const SaleAgreementForm = dynamic(
  () => import('@/components/features/contract-sale/SaleAgreementForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'مبایعه‌نامه ملک | ساخت آنلاین مبایعه‌نامه خرید و فروش ملک',
  description:
    'ساخت مبایعه‌نامه ملک حرفه‌ای به صورت آنلاین. مبایعه‌نامه استاندارد، جامع و آپارتمان با بندهای حقوقی و خروجی PDF و Word. بدون اشتراک ماهانه.',
  path: '/contract-tools/sale-agreement',
  keywords: [
    'مبایعه‌نامه',
    'مبایعه‌نامه ملک',
    'ساخت مبایعه‌نامه',
    'قرارداد خرید و فروش ملک',
    'نمونه مبایعه‌نامه',
  ],
});

export default async function SaleAgreementPage() {
  const pack3PricingFaq = await getPack3FaqAnswer(
    ' و نیازی به اشتراک ماهانه ندارد. مبایعه‌نامه با ۲ اعتبار خروجی تمیز صادر می‌شود.',
  );

  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="sale-agreement-breadcrumb"
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
              { '@type': 'ListItem', position: 3, name: 'مبایعه‌نامه ملک' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای قرارداد', url: `${siteUrl}/contract-tools` },
          { name: 'مبایعه‌نامه ملک', url: `${siteUrl}/contract-tools/sale-agreement` },
        ]}
      />
      <Script
        id="sale-agreement-faq"
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
                  text: 'این مبایعه‌نامه یک پیش‌نویس بر اساس اطلاعات واردشده توسط شماست و جایگزین سند رسمی ثبت‌اسناد و املاک نیست. برای رسمی‌سازی باید به دفترخانه مراجعه کنید.',
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
                name: 'بندهای حقوقی مبایعه‌نامه بر چه اساسی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بندهای پیش‌فرض بر اساس قوانین جاری کشور و رویه‌های رایج معاملات ملکی تنظیم شده‌اند و قابل ویرایش توسط کاربر هستند.',
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
        <SaleAgreementForm />
      </div>
    </SiteShell>
  );
}
