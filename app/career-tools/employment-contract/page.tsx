import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

const EmploymentContractForm = dynamic(
  () => import('@/components/features/business-employment/EmploymentContractForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'قرارداد کار حرفه‌ای | ساخت آنلاین قرارداد اشتغال به کار',
  description:
    'ساخت قرارداد کار حرفه‌ای مطابق قانون کار جمهوری اسلامی ایران. قرارداد کار استاندارد و جامع با بندهای حقوقی و خروجی PDF و Word. بدون اشتراک ماهانه.',
  path: '/career-tools/employment-contract',
  keywords: [
    'قرارداد کار',
    'نمونه قرارداد کار',
    'ساخت قرارداد کار',
    'قرارداد اشتغال به کار',
    'قرارداد کار PDF',
  ],
});

export default function EmploymentContractPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="employment-contract-breadcrumb"
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
                name: 'ابزارهای شغلی',
                item: `${siteUrl}/career-tools`,
              },
              { '@type': 'ListItem', position: 3, name: 'قرارداد کار' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای شغلی', url: `${siteUrl}/career-tools` },
          { name: 'قرارداد کار', url: `${siteUrl}/career-tools/employment-contract` },
        ]}
      />
      <Script
        id="employment-contract-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا این قرارداد کار رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'این قرارداد یک پیش‌نویس بر اساس اطلاعات واردشده توسط شماست و جایگزین قرارداد رسمی وزارت کار نیست. برای رسمی‌سازی باید در سامانه وزارت کار ثبت شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات من به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات هرگز از دستگاه شما خارج نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'چه نوع قراردادهایی می‌توانم بسازم؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'می‌توانید قراردادهای دائم، مدت معین، پاره وقت و آزمایشی را با بندهای استاندارد و حرفه‌ای بسازید.',
                },
              },
              {
                '@type': 'Question',
                name: 'هزینه خروجی حرفه‌ای چقدر است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بسته ۳ خروجی تمیز فقط ۴۹,۰۰۰ تومان است و نیازی به اشتراک ماهانه ندارد. قراردادهای حقوقی با ۲ اعتبار خروجی تمیز صادر می‌شوند.',
                },
              },
            ],
          }),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <EmploymentContractForm />
      </div>
    </SiteShell>
  );
}
