import dynamic from 'next/dynamic';
const DynamicAddWatermarkPage = dynamic(
  () => import('@/features/pdf-tools/watermark/add-watermark').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/watermark/add-watermark');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddWatermarkRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'افزودن واترمارک' },
        ]}
      />
      <Script
        id="add-watermark-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه افزودن واترمارک به PDF',
            description: 'افزودن واترمارک متنی به فایل PDF',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب کنید' },
              {
                name: 'متن واترمارک را وارد کنید',
                text: 'متن واترمارک و تنظیمات ظاهری را مشخص کنید',
              },
              { name: 'افزودن و دانلود کنید', text: 'فایل PDF با واترمارک را دانلود کنید' },
            ],
          }),
        }}
      />
      <DynamicAddWatermarkPage />
    </ToolPageShell>
  );
}
