import ExtractPagesPage from '@/features/pdf-tools/extract/extract-pages';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

const tool = getToolWithMetadataOverride('/pdf-tools/extract/extract-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ExtractPagesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'استخراج صفحات' },
        ]}
      />
      <Script
        id="extract-pages-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه استخراج صفحات از PDF',
            description: 'استخراج صفحات خاص از فایل PDF',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب کنید' },
              {
                name: 'صفحات مورد نظر را انتخاب کنید',
                text: 'شماره صفحاتی که می‌خواهید استخراج شوند را وارد کنید',
              },
              { name: 'استخراج و دانلود کنید', text: 'فایل PDF حاوی صفحات انتخابی را دانلود کنید' },
            ],
          }),
        }}
      />
      <ExtractPagesPage />
    </ToolPageShell>
  );
}
