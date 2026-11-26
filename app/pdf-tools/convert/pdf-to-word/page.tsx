import PdfToWord from '@/features/pdf-tools/convert/pdf-to-word';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-word');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToWordRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'تبدیل PDF به Word', url: `${siteUrl}/pdf-tools/convert/pdf-to-word` },
        ]}
      />
      <Script
        id="howto-pdf-to-word"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل PDF به Word',
            description: 'ذخیرهٔ متن قابل انتخاب PDF در فایل Word قابل ویرایش',
            step: [
              {
                '@type': 'HowToStep',
                name: 'فایل PDF را انتخاب کنید',
                text: 'فایل PDF مورد نظر را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تبدیل را شروع کنید',
                text: 'روی دکمه تبدیل کلیک کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'فایل Word را دانلود کنید',
                text: 'فایل تبدیل شده را دانلود کنید',
              },
            ],
          }),
        }}
      />
      <PdfToWord />
    </ToolPageShell>
  );
}
