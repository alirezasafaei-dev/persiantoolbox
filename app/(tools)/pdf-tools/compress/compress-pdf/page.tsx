import dynamic from 'next/dynamic';
const DynamicCompressPdfPage = dynamic(
  () => import('@/features/pdf-tools/compress/compress-pdf').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/compress/compress-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function CompressPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'فشرده‌سازی PDF' },
        ]}
      />
      <Script
        id="compress-pdf-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه فشرده‌سازی فایل PDF',
            description: 'کاهش حجم فایل PDF بدون افت کیفیت محسوس',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب یا drag کنید' },
              {
                name: 'سطح فشرده‌سازی را انتخاب کنید',
                text: 'یکی از سطوح فشرده‌سازی (بالا، متوسط، پایین) را انتخاب کنید',
              },
              {
                name: 'فشرده‌سازی و دانلود کنید',
                text: 'روی دکمه فشرده‌سازی کلیک کنید و فایل کاهش یافته را دانلود کنید',
              },
            ],
          }),
        }}
      />
      <DynamicCompressPdfPage />
    </ToolPageShell>
  );
}
