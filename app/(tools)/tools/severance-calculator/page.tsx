import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const SeveranceCalculator = dynamic(
  () => import('@/components/features/finance/SeveranceCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/severance-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SeveranceCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/finance-tools` },
          { name: 'محاسبه حق سنوات' },
        ]}
      />
      <Script
        id="severance-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه حق سنوات و مرخصی استفاده نشده',
            description:
              'راهنمای گام به گام محاسبه حق سنوات و مرخصی استفاده نشده هنگام خروج از شرکت',
            step: [
              {
                '@type': 'HowToStep',
                name: 'تعداد ماه‌های کارکرد را وارد کنید',
                text: 'تعداد ماه‌هایی که در شرکت کار کرده‌اید را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'حقوق ماهانه را وارد کنید',
                text: 'مبلغ حقوق پایه ماهانه خود را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مرخصی استفاده نشده را وارد کنید',
                text: 'تعداد روزهای مرخصی استفاده نشده را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'مبلغ حق سنوات و مرخصی استفاده نشده محاسبه شده را ببینید',
              },
            ],
          }),
        }}
      />
      <SeveranceCalculator />
    </ToolPageShell>
  );
}
