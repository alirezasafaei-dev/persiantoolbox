import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicWordToPdfPage = dynamic(
  () => import('@/features/pdf-tools/convert/word-to-pdf').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools/convert/word-to-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function WordToPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'تبدیل Word به PDF', url: `${siteUrl}/pdf-tools/convert/word-to-pdf` },
        ]}
      />
      <Script
        id="howto-word-to-pdf"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل Word به PDF',
            description: 'تبدیل فایل Word به فرمت PDF',
            step: [
              {
                '@type': 'HowToStep',
                name: 'فایل Word را انتخاب کنید',
                text: 'فایل Word (.docx) مورد نظر را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تبدیل را شروع کنید',
                text: 'روی دکمه تبدیل کلیک کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'فایل PDF را دانلود کنید',
                text: 'فایل PDF تبدیل شده را دانلود کنید',
              },
            ],
          }),
        }}
      />
      <DynamicWordToPdfPage />
    </ToolPageShell>
  );
}
