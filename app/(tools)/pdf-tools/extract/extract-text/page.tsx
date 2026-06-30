import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicExtractTextPage = dynamic(
  () => import('@/features/pdf-tools/extract/extract-text').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools/extract/extract-text');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ExtractTextRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'استخراج متن', url: `${siteUrl}/pdf-tools/extract/extract-text` },
        ]}
      />
      <Script
        id="howto-extract-text"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه استخراج متن از PDF',
            description: 'استخراج متن از فایل PDF',
            step: [
              {
                '@type': 'HowToStep',
                name: 'فایل PDF را انتخاب کنید',
                text: 'فایل PDF حاوی متن را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'استخراج متن',
                text: 'عملیات استخراج متن انجام می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را کپی کنید',
                text: 'متن استخراج شده را کپی یا دانلود کنید',
              },
            ],
          }),
        }}
      />
      <DynamicExtractTextPage />
    </ToolPageShell>
  );
}
