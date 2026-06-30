import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicPdfToTextPage = dynamic(
  () => import('@/features/pdf-tools/convert/pdf-to-text').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-text');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToTextRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'تبدیل PDF به متن', url: `${siteUrl}/pdf-tools/convert/pdf-to-text` },
        ]}
      />
      <Script
        id="howto-pdf-to-text"
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
                name: 'فایل PDF را آپلود کنید',
                text: 'فایل PDF حاوی متن را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'استخراج متن',
                text: 'عملیات استخراج متن انجام می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'متن را کپی کنید',
                text: 'متن استخراج شده را کپی یا دانلود کنید',
              },
            ],
          }),
        }}
      />
      <DynamicPdfToTextPage />
    </ToolPageShell>
  );
}
