import ReorderPagesPage from '@/features/pdf-tools/edit/reorder-pages';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

const tool = getToolWithMetadataOverride('/pdf-tools/edit/reorder-pages');

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
      <ReorderPagesPage />
    </ToolPageShell>
  );
}
