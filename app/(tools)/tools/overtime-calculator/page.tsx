import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';

const OvertimeCalculator = dynamic(
  () => import('@/components/features/finance/OvertimeCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/overtime-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function OvertimeCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="overtime-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه حق اضافه کاری',
            description: 'راهنمای گام به گام محاسبه حق اضافه کاری بر اساس قانون کار ایران',
            step: [
              {
                '@type': 'HowToStep',
                name: 'حقوق پایه ماهانه را وارد کنید',
                text: 'مبلغ حقوق پایه ماهانه خود را قبل از کسر بیمه وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'ساعات اضافه کاری را وارد کنید',
                text: 'تعداد ساعت‌های اضافه کاری انجام شده در ماه را وارد نمایید',
              },
              {
                '@type': 'HowToStep',
                name: 'نوع اضافه کاری را انتخاب کنید',
                text: 'اضافه کاری عادی یا تعطیلات را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مبلغ حق اضافه کاری را مشاهده کنید',
                text: 'مبلغ قابل پرداخت بر اساس ۴۰٪ اضافه بر حقوق پایه محاسبه می‌شود',
              },
            ],
          }),
        }}
      />
      <OvertimeCalculator />
      <FinancialTransparencyBox
        calculationName="محاسبه‌گر اضافه کاری"
        formulaSummary="۴۰٪ اضافه بر حقوق پایه"
        dataSource="قانون کار جمهوری اسلامی ایران"
      />
    </ToolPageShell>
  );
}
