import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

export const revalidate = 3600;

const LeaseAgreementForm = dynamic(
  () => import('@/components/features/contract-lease/LeaseAgreementForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'اجاره‌نامه مسکونی | ساخت آنلاین قرارداد اجاره ملک',
  description:
    'ساخت اجاره‌نامه مسکونی حرفه‌ای به صورت آنلاین. قرارداد اجاره استاندارد و جامع با بندهای حقوقی و خروجی PDF و Word. بدون اشتراک ماهانه.',
  path: '/contract-tools/lease-agreement',
  keywords: [
    'اجاره‌نامه',
    'قرارداد اجاره',
    'ساخت اجاره‌نامه',
    'قرارداد اجاره مسکونی',
    'نمونه اجاره‌نامه',
  ],
});

export default async function LeaseAgreementPage() {
  const pack3PricingFaq = await getPack3FaqAnswer(
    ' و نیازی به اشتراک ماهانه ندارد. اجاره‌نامه با ۲ اعتبار خروجی تمیز صادر می‌شود.',
  );

  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="lease-agreement-breadcrumb"
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
              { '@type': 'ListItem', position: 3, name: 'اجاره‌نامه مسکونی' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای قرارداد', url: `${siteUrl}/contract-tools` },
          { name: 'اجاره‌نامه مسکونی', url: `${siteUrl}/contract-tools/lease-agreement` },
        ]}
      />
      <Script
        id="lease-agreement-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا این اجاره‌نامه رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'این اجاره‌نامه یک پیش‌نویس بر اساس اطلاعات واردشده توسط شماست و جایگزین اجاره‌نامه رسمی بنگاه یا ثبت‌اسناد نیست.',
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
                name: 'آیا می‌توانم بندهای دلخواه اضافه کنم؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'در نسخه رایگان بندهای استاندارد قابل استفاده هستند. برای اضافه کردن بندهای حرفه‌ای و سفارشی می‌توانید به نسخه پریمیوم ارتقا دهید.',
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
        <LeaseAgreementForm />
      </div>
    </SiteShell>
  );
}
