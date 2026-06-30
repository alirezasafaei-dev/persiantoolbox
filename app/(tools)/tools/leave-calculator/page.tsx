import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';

const LeaveCalculator = dynamic(
  () => import('@/components/features/finance/LeaveCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/leave-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LeaveCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'محاسبه مرخصی' },
        ]}
      />
      <Script
        id="leave-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه مرخصی استحقاقی',
            description: 'راهنمای گام به گام محاسبه مرخصی استحقاقی و سالانه بر اساس قانون کار',
            step: [
              {
                '@type': 'HowToStep',
                name: 'تعداد روزهای کارکرد را وارد کنید',
                text: 'تعداد روزهای کاری انجام شده در سال را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مرخصی استفاده شده را وارد کنید',
                text: 'تعداد روزهای مرخصی که تاکنون استفاده کرده‌اید را وارد نمایید',
              },
              {
                '@type': 'HowToStep',
                name: 'نوع مرخصی را انتخاب کنید',
                text: 'مرخصی استحقاقی، استعلاجی یا بدون حقوق را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'روزهای باقی‌مانده مرخصی و معادل مالی آن را ببینید',
              },
            ],
          }),
        }}
      />
      <LeaveCalculator />
      <FinancialTransparencyBox
        calculationName="محاسبه‌گر مرخصی"
        formulaSummary="۲۶ روز مرخصی سالانه + ۹ روز جمعه"
        dataSource="قانون کار - ماده ۷۸"
      />
    </ToolPageShell>
  );
}
