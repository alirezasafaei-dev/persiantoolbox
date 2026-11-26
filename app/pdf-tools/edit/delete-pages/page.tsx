import DeletePagesPage from '@/features/pdf-tools/edit/delete-pages';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/edit/delete-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function DeletePagesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'حذف صفحات' },
        ]}
      />
      <Script
        id="delete-pages-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه حذف صفحات PDF',
            description: 'حذف صفحات اضافی از فایل PDF',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب کنید' },
              {
                name: 'صفحات مورد نظر را انتخاب کنید',
                text: 'صفحاتی که می‌خواهید حذف شوند را مشخص کنید',
              },
              { name: 'حذف و دانلود کنید', text: 'فایل PDF کاهش یافته را دانلود کنید' },
            ],
          }),
        }}
      />
      <DeletePagesPage />
    </ToolPageShell>
  );
}
