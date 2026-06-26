import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DateConverterPage = dynamic(
  () => import('@/components/features/date-tools/DateConverter').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/date-tools/shamsi-gregorian');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function DateConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'تبدیل تاریخ شمسی به میلادی' },
        ]}
      />
      <Script
        id="shamsi-gregorian-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل تاریخ شمسی به میلادی',
            description: 'راهنمای گام به گام تبدیل تاریخ شمسی به میلادی با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تاریخ شمسی',
                text: 'تاریخ شمسی مورد نظر خود را با استفاده از تقویم انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده تاریخ میلادی',
                text: 'معادل میلادی تاریخ انتخابی بلافاصله نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'تبدیل تاریخ شمسی به میلادی',
              url: `${siteUrl}/date-tools/shamsi-gregorian`,
            },
          }),
        }}
      />
      <DateConverterPage />
    </ToolPageShell>
  );
}
