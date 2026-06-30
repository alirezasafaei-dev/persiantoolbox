import dynamic from 'next/dynamic';
const DynamicSplitPdfPage = dynamic(
  () => import('@/features/pdf-tools/split/split-pdf').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/split/split-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SplitPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'تقسیم PDF' },
        ]}
      />
      <Script
        id="split-pdf-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تقسیم فایل PDF',
            description: 'تقسیم فایل PDF به چند فایل جداگانه',
            step: [
              { name: 'فایل PDF را آپلود کنید', text: 'فایل PDF مورد نظر را انتخاب کنید' },
              {
                name: 'صفحات مورد نظر را انتخاب کنید',
                text: 'صفحاتی که می‌خواهید جدا شوند را مشخص کنید',
              },
              { name: 'تقسیم و دانلود کنید', text: 'فایل‌های جدا شده را دانلود کنید' },
            ],
          }),
        }}
      />
      <DynamicSplitPdfPage />
    </ToolPageShell>
  );
}
