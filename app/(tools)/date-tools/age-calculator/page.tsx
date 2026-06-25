import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicAgeCalculator = dynamic(
  () => import('@/components/features/date-tools/AgeCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/date-tools/age-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function AgeCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'محاسبه سن' },
        ]}
      />
      <Script
        id="age-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه سن',
            description: 'راهنمای گام به گام محاسبه سن با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب نوع تقویم',
                text: 'تقویم تولد (شمسی یا میلادی) را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'وارد کردن تاریخ تولد',
                text: 'تاریخ تولد خود را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده نتیجه',
                text: 'سن دقیق شما به سال، ماه و روز نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'محاسبه سن',
              url: `${siteUrl}/date-tools/age-calculator`,
            },
          }),
        }}
      />
      <DynamicAgeCalculator />
    </ToolPageShell>
  );
}
