import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const PersianCalendarPage = dynamic(
  () => import('@/components/features/date-tools/PersianCalendar').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/date-tools/persian-calendar');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function PersianCalendarRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'تقویم شمسی' },
        ]}
      />
      <Script
        id="persian-calendar-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه استفاده از تقویم شمسی',
            description: 'راهنمای گام به گام استفاده از تقویم شمسی آنلاین جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تاریخ مبدأ',
                text: 'تاریخ شمسی مورد نظر خود را از تقویم انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'انتخاب نوع تقویم',
                text: 'نوع تقویم مقصد (میلادی، قمری یا هجری شمسی) را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده نتیجه',
                text: 'تاریخ تبدیل شده در تقویم مقصد نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'تقویم شمسی',
              url: `${siteUrl}/date-tools/persian-calendar`,
            },
          }),
        }}
      />
      <PersianCalendarPage />
    </ToolPageShell>
  );
}
