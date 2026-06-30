import dynamic from 'next/dynamic';
const DynamicReorderPagesPage = dynamic(
  () => import('@/features/pdf-tools/edit/reorder-pages').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/edit/reorder-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ReorderPagesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'مرتب‌سازی صفحات' },
        ]}
      />
      <Script
        id="reorder-pages-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه مرتب‌سازی صفحات PDF',
            description: 'تغییر ترتیب صفحات فایل PDF',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب کنید' },
              { name: 'صفحات را مرتب کنید', text: 'ترتیب صفحات را با drag و drop تغییر دهید' },
              { name: 'ذخیره کنید', text: 'فایل PDF مرتب شده را دانلود کنید' },
            ],
          }),
        }}
      />
      <DynamicReorderPagesPage />
    </ToolPageShell>
  );
}
