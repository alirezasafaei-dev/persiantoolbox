import Script from 'next/script';
import DateDifferencePage from '@/components/features/date-tools/DateDifference';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/date-tools/date-difference');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function DateDifferenceRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'محاسبه تفاوت دو تاریخ' },
        ]}
      />
      <Script
        id="date-difference-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه تفاوت دو تاریخ',
            description: 'راهنمای گام به گام محاسبه تفاوت دو تاریخ با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'وارد کردن دو تاریخ',
                text: 'تاریخ شروع و تاریخ پایان را با استفاده از تقویم وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده تفاوت',
                text: 'تفاوت دو تاریخ بر اساس روز، ماه و سال نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'محاسبه تفاوت دو تاریخ',
              url: `${siteUrl}/date-tools/date-difference`,
            },
          }),
        }}
      />
      <DateDifferencePage />
    </ToolPageShell>
  );
}
