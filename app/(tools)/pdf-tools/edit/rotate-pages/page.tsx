import dynamic from 'next/dynamic';
const DynamicRotatePagesPage = dynamic(
  () => import('@/features/pdf-tools/edit/rotate-pages').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/edit/rotate-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RotatePagesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'چرخش صفحات' },
        ]}
      />
      <Script
        id="rotate-pages-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه چرخش صفحات PDF',
            description: 'چرخش صفحات فایل PDF',
            step: [
              { name: 'فایل PDF را انتخاب کنید', text: 'فایل PDF مورد نظر را انتخاب کنید' },
              {
                name: 'صفحات را بچرخانید',
                text: 'زاویه چرخش مورد نظر را برای هر صفحه انتخاب کنید',
              },
              { name: 'ذخیره کنید', text: 'فایل PDF چرخش شده را دانلود کنید' },
            ],
          }),
        }}
      />
      <DynamicRotatePagesPage />
    </ToolPageShell>
  );
}
