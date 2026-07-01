import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const revalidate = 3600;

const PersianWritingStudio = dynamic(
  () => import('@/components/features/persian-writing/PersianWritingStudio'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--text-muted)] text-sm">
          در حال بارگذاری ویرایشگر...
        </div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'ویرایشگر فارسی پیشرفته | پاک‌سازی و اصلاح متن آنلاین رایگان',
  description:
    'ویرایشگر متن فارسی با اصلاح خودکار حروف عربی، نیم‌فاصله، علائم نگارشی و فاصله‌گذاری. پردازش ۱۰۰٪ محلی در مرورگر. بدون اشتراک ماهانه.',
  path: '/writing-tools/persian-writing-studio',
  keywords: [
    'ویرایشگر فارسی',
    'پاک‌سازی متن فارسی',
    'اصلاح نگارش فارسی',
    'نرمال‌سازی متن فارسی',
    'نیم‌فاصله',
    'اصلاح حروف عربی',
    'ویرایش متن آنلاین',
  ],
});

export default function PersianWritingStudioPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="persian-writing-studio-breadcrumb"
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
                name: 'ابزارهای نگارش فارسی',
                item: `${siteUrl}/writing-tools`,
              },
              { '@type': 'ListItem', position: 3, name: 'ویرایشگر فارسی پیشرفته' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای نگارش فارسی', url: `${siteUrl}/writing-tools` },
          {
            name: 'ویرایشگر فارسی پیشرفته',
            url: `${siteUrl}/writing-tools/persian-writing-studio`,
          },
        ]}
      />
      <Script
        id="persian-writing-studio-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا متن من به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. متن شما هرگز از دستگاه خارج نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'ویرایشگر فارسی چه کاری انجام می‌دهد؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'اصلاح حروف عربی به فارسی، نیم‌فاصله، علائم نگارشی، فاصله‌گذاری و آمار متن.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا استفاده از ویرایشگر رایگان است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، استفاده پایه رایگان است. نسخه حرفه‌ای حالت سخت‌گیرانه و محدودیت کاراکتر بیشتری ارائه می‌دهد.',
                },
              },
            ],
          }),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <PersianWritingStudio />
      </div>
    </SiteShell>
  );
}
