import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicImageToPdfPage = dynamic(
  () => import('@/features/pdf-tools/convert/image-to-pdf').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools/convert/image-to-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageToPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'تبدیل تصویر به PDF', url: `${siteUrl}/pdf-tools/convert/image-to-pdf` },
        ]}
      />
      <Script
        id="howto-image-to-pdf"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل تصویر به PDF',
            description: 'تبدیل تصاویر به فایل PDF',
            step: [
              {
                '@type': 'HowToStep',
                name: 'تصاویر را انتخاب کنید',
                text: 'تصاویر مورد نظر را انتخاب یا drag کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'ترتیب و تنظیمات',
                text: 'ترتیب تصاویر و تنظیمات صفحه را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تبدیل و دانلود',
                text: 'فایل PDF نهایی را دانلود کنید',
              },
            ],
          }),
        }}
      />
      <DynamicImageToPdfPage />
    </ToolPageShell>
  );
}
