import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';

const RetirementCalculator = dynamic(
  () => import('@/components/features/finance/RetirementCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/retirement-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RetirementCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="retirement-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه مستمری بازنشستگی',
            description: 'راهنمای گام به گام محاسبه مستمری و حقوق بازنشستگی بر اساس سنوات خدمت',
            step: [
              {
                '@type': 'HowToStep',
                name: 'سنوات خدمت خود را وارد کنید',
                text: 'تعداد سال‌های خدمت رسمی و بیمه‌پردازی خود را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'حقوق متوسط سه سال آخر را وارد کنید',
                text: 'متوسط حقوق دریافتی سه سال آخر خدمت را وارد نمایید',
              },
              {
                '@type': 'HowToStep',
                name: 'نوع بازنشستگی را انتخاب کنید',
                text: 'بازنشستگی عادی، پیش‌رسیده یا مشترک را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'مبلغ مستمری ماهانه و درصد حقوق بازنشستگی نسبت به حقوق فعال را ببینید',
              },
            ],
          }),
        }}
      />
      <RetirementCalculator />
      <FinancialTransparencyBox
        calculationName="محاسبه‌گر بازنشستگی"
        formulaSummary="بر اساس سنوات خدمت و حقوق متوسط ۳ سال آخر"
        dataSource="قانون تأمین اجتماعی"
      />
    </ToolPageShell>
  );
}
