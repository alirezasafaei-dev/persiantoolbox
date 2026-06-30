import dynamic from 'next/dynamic';
const DynamicMergePdfPage = dynamic(
  () => import('@/features/pdf-tools/merge/merge-pdf').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/merge/merge-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function MergePdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'ادغام PDF' },
        ]}
      />
      <Script
        id="merge-pdf-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه ادغام فایل‌های PDF',
            description: 'ادغام چند فایل PDF در یک فایل واحد با پردازش محلی',
            step: [
              {
                name: 'فایل‌ها را انتخاب کنید',
                text: 'فایل‌های PDF مورد نظر را انتخاب یا drag کنید',
              },
              {
                name: 'ترتیب صفحات را تنظیم کنید',
                text: 'ترتیب فایل‌ها را با drag و drop تنظیم کنید',
              },
              {
                name: 'ادغام و دانلود کنید',
                text: 'روی دکمه ادغام کلیک کنید و فایل نهایی را دانلود کنید',
              },
            ],
          }),
        }}
      />
      <DynamicMergePdfPage />
    </ToolPageShell>
  );
}
