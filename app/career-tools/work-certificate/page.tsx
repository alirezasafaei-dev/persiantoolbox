import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

const WorkCertificateForm = dynamic(
  () => import('@/components/features/work-certificate/WorkCertificateForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'گواهی سابقه کار حرفه‌ای | ساخت آنلاین گواهی اشتغال به کار',
  description:
    'ساخت گواهی سابقه کار رسمی، مدرن و دو زبانه به صورت آنلاین. گواهی اشتغال به کار با خروجی PDF و Word مناسب بانک، ویزا و ادارات. بدون اشتراک ماهانه.',
  path: '/career-tools/work-certificate',
  keywords: [
    'گواهی سابقه کار',
    'گواهی اشتغال به کار',
    'ساخت گواهی سابقه کار',
    'نمونه گواهی اشتغال',
    'گواهی اشتغال آنلاین',
  ],
});

export default function WorkCertificatePage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="work-certificate-breadcrumb"
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
              { '@type': 'ListItem', position: 3, name: 'گواهی سابقه کار' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای شغلی', url: `${siteUrl}/career-tools` },
          { name: 'گواهی سابقه کار', url: `${siteUrl}/career-tools/work-certificate` },
        ]}
      />
      <Script
        id="work-certificate-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا گواهی سابقه کار رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'این گواهی یک پیش‌نویس بر اساس اطلاعات واردشده توسط شماست و جایگزین گواهی رسمی اداره کار یا سازمان اداری و استخدامی نیست.',
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
                name: 'گواهی دو زبانه چیست؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'گواهی دو زبانه هم به فارسی و هم به انگلیسی صادر می‌شود که برای ارائه به سفارت‌ها، بانک‌های بین‌المللی و شرکت‌های خارجی مناسب است.',
                },
              },
              {
                '@type': 'Question',
                name: 'هزینه خروجی حرفه‌ای چقدر است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بسته ۳ خروجی تمیز فقط ۴۹,۰۰۰ تومان است و نیازی به اشتراک ماهانه ندارد. خروجی رایگان با واترمارک نیز موجود است.',
                },
              },
            ],
          }),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <WorkCertificateForm />
      </div>
    </SiteShell>
  );
}
