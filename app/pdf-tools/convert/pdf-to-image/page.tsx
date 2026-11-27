import PdfToImagePage from '@/features/pdf-tools/convert/pdf-to-image';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
      <PdfToImagePage />
    </ToolPageShell>
  );
}
