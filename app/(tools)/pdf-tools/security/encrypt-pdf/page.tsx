import dynamic from 'next/dynamic';
const DynamicEncryptPdfPage = dynamic(
  () => import('@/features/pdf-tools/security/encrypt-pdf').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/security/encrypt-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function EncryptPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'رمزگذاری PDF' },
        ]}
      />
      <Script
        id="encrypt-pdf-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه رمزگذاری فایل PDF',
            description: 'افزودن رمز عبور به فایل PDF',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب کنید' },
              { name: 'رمز عبور را وارد کنید', text: 'رمز عبور مورد نظر را وارد کنید' },
              { name: 'رمزگذاری و دانلود کنید', text: 'فایل PDF رمزگذاری شده را دانلود کنید' },
            ],
          }),
        }}
      />
      <DynamicEncryptPdfPage />
    </ToolPageShell>
  );
}
