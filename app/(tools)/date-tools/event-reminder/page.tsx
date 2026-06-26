import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const EventReminderPage = dynamic(
  () => import('@/components/features/date-tools/EventReminder').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/date-tools/event-reminder');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function EventReminderRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'یادآور رویداد' },
        ]}
      />
      <Script
        id="event-reminder-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تنظیم یادآور رویداد',
            description: 'راهنمای گام به گام تنظیم یادآوری رویداد با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تاریخ رویداد',
                text: 'تاریخ رویداد مورد نظر خود را با استفاده از تقویم انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تنظیم یادآوری',
                text: 'زمان یادآوری و نوع اعلان را تنظیم کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'یادآور رویداد',
              url: `${siteUrl}/date-tools/event-reminder`,
            },
          }),
        }}
      />
      <EventReminderPage />
    </ToolPageShell>
  );
}
