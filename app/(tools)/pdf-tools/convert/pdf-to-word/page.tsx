import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const PdfToWord = dynamic(
  () => import('@/features/pdf-tools/convert/pdf-to-word').then((m) => m.default),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-10 w-48 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

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
            description: 'تبدیل فایل PDF به فرمت Word با حفظ قالب‌بندی',
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
