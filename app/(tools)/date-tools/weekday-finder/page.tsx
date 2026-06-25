import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicWeekdayFinder = dynamic(
  () => import('@/components/features/date-tools/WeekdayFinder').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/date-tools/weekday-finder');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function WeekdayFinderRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'روز هفته' },
        ]}
      />
      <Script
        id="weekday-finder-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه پیدا کردن روز هفته',
            description: 'راهنمای گام به گام پیدا کردن روز هفته با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب نوع تقویم',
                text: 'تقویم مورد نظر (شمسی یا میلادی) را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'وارد کردن تاریخ',
                text: 'تاریخ مورد نظر را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده روز هفته',
                text: 'روز هفته تاریخ وارد شده نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'روز هفته',
              url: `${siteUrl}/date-tools/weekday-finder`,
            },
          }),
        }}
      />
      <DynamicWeekdayFinder />
    </ToolPageShell>
  );
}
