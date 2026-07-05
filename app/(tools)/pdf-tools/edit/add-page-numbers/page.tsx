import dynamic from 'next/dynamic';
import Script from 'next/script';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicAddPageNumbersPage = dynamic(
  () => import('@/features/pdf-tools/paginate/add-page-numbers').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools/edit/add-page-numbers');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddPageNumbersRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'افزودن شماره صفحه' },
        ]}
      />
      <Script
        id="add-page-numbers-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه افزودن شماره صفحه به PDF',
            description: 'اضافه کردن شماره صفحه در موقعیت دلخواه به فایل PDF',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب کنید.' },
              {
                name: 'موقعیت شماره صفحه را انتخاب کنید',
                text: 'محل نمایش شماره صفحه را مشخص کنید.',
              },
              {
                name: 'شماره‌گذاری و دانلود کنید',
                text: 'فایل PDF شماره‌گذاری‌شده را دانلود کنید.',
              },
            ],
          }),
        }}
      />
      <DynamicAddPageNumbersPage />
    </ToolPageShell>
  );
}
