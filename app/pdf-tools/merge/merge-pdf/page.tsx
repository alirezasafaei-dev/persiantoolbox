import MergePdfPage from '@/features/pdf-tools/merge/merge-pdf';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

const tool = getToolWithMetadataOverride('/pdf-tools/merge/merge-pdf');

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
      <MergePdfPage />
    </ToolPageShell>
  );
}
