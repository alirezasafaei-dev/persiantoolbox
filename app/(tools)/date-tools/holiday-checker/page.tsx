import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicHolidayChecker = dynamic(
  () => import('@/components/features/date-tools/HolidayChecker').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/date-tools/holiday-checker');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function HolidayCheckerRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'بررسی تعطیلات' },
        ]}
      />
      <Script
        id="holiday-checker-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه بررسی تعطیلات رسمی',
            description: 'راهنمای گام به گام بررسی تعطیلات رسمی با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب نوع تقویم',
                text: 'تقویم مورد نظر (شمسی یا قمری) را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'وارد کردن تاریخ',
                text: 'تاریخ مورد نظر را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده نتیجه',
                text: 'مشخص می‌شود آیا تاریخ تعطیل رسمی است یا نه',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'بررسی تعطیلات رسمی',
              url: `${siteUrl}/date-tools/holiday-checker`,
            },
          }),
        }}
      />
      <DynamicHolidayChecker />
    </ToolPageShell>
  );
}
