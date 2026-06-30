import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicPdfToImagePage = dynamic(
  () => import('@/features/pdf-tools/convert/pdf-to-image').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToImageRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'تبدیل PDF به تصویر', url: `${siteUrl}/pdf-tools/convert/pdf-to-image` },
        ]}
      />
      <Script
        id="howto-pdf-to-image"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل PDF به تصویر',
            description: 'تبدیل صفحات PDF به تصاویر JPG',
            step: [
              {
                '@type': 'HowToStep',
                name: 'فایل PDF را انتخاب کنید',
                text: 'فایل PDF مورد نظر را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'کیفیت تصویر را انتخاب کنید',
                text: 'رزولوشن و فرمت خروجی را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تصاویر را دانلود کنید',
                text: 'تصاویر تبدیل شده را دانلود کنید',
              },
            ],
          }),
        }}
      />
      <DynamicPdfToImagePage />
    </ToolPageShell>
  );
}
