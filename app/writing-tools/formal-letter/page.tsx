import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

const FormalLetterForm = dynamic(
  () => import('@/components/features/formal-letter/FormalLetterForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'نامه اداری حرفه‌ای | ساخت آنلاین نامه رسمی اداری',
  description:
    'ساخت نامه اداری رسمی با قالب‌های حرفه‌ای. انواع نامه درخواست، شکایت، استعلام، معرفی، ابلاغیه و نامه همراه با خروجی PDF و Word. بدون اشتراک ماهانه.',
  path: '/writing-tools/formal-letter',
  keywords: ['نامه اداری', 'ساخت نامه اداری', 'نامه رسمی', 'نامه اداری آنلاین', 'نمونه نامه اداری'],
});

export default function FormalLetterPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="formal-letter-breadcrumb"
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
                name: 'ابزارهای نگارش',
                item: `${siteUrl}/writing-tools`,
              },
              { '@type': 'ListItem', position: 3, name: 'نامه اداری' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای نگارش', url: `${siteUrl}/writing-tools` },
          { name: 'نامه اداری', url: `${siteUrl}/writing-tools/formal-letter` },
        ]}
      />
      <Script
        id="formal-letter-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا این نامه رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'این نامه یک پیش‌نویس بر اساس اطلاعات واردشده توسط شماست و جایگزین نامه با سربرگ رسمی سازمانی نیست.',
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
                name: 'چه نوع نامه‌هایی می‌توانم بسازم؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'می‌توانید انواع نامه درخواست، شکایت، استعلام، معرفی، ابلاغیه و نامه همراه را با قالب رسمی یا مدرن بسازید.',
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
        <FormalLetterForm />
      </div>
    </SiteShell>
  );
}
