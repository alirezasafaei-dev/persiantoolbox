import dynamic from 'next/dynamic';
const DynamicDecryptPdfPage = dynamic(
  () => import('@/features/pdf-tools/security/decrypt-pdf').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/security/decrypt-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function DecryptPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'رمزگشایی PDF' },
        ]}
      />
      <Script
        id="decrypt-pdf-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه رمزگشایی فایل PDF',
            description: 'حذف رمز عبور از فایل PDF',
            step: [
              {
                name: 'فایل PDF رمزدار را انتخاب کنید',
                text: 'فایل PDF رمزدار مورد نظر را انتخاب کنید',
              },
              { name: 'رمز عبور را وارد کنید', text: 'رمز عبور فایل را وارد کنید' },
              { name: 'رمزگشایی و دانلود کنید', text: 'فایل PDF رمزگشایی شده را دانلود کنید' },
            ],
          }),
        }}
      />
      <DynamicDecryptPdfPage />
    </ToolPageShell>
  );
}
