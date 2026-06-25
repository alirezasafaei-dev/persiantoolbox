import Script from 'next/script';
import EventReminderPage from '@/components/features/date-tools/EventReminder';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
