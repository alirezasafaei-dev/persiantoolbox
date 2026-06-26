import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const InflationCalculatorPage = dynamic(
  () => import('@/components/features/finance/inflation-calculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/inflation-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InflationCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="inflation-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه نرخ تورم',
            description:
              'راهنمای گام به گام محاسبه نرخ تورم و قدرت خرید پول با استفاده از ماشین‌حساب آنلاین',
            step: [
              {
                '@type': 'HowToStep',
                name: 'قیمت کالا در سال مبدأ را وارد کنید',
                text: 'مبلغ کالا یا سبد خرید در سال پایه را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'قیمت کالا در سال مقصد را وارد کنید',
                text: 'مبلغ همان کالا یا سبد خرید در سال جاری را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'سال‌ها را مشخص کنید',
                text: 'تعداد سال‌های گذشته بین دو سال مبدأ و مقصد را تعیین کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'نرخ تورم سالانه، تورم تجمعی و قدرت خرید باقی‌مانده پول را ببینید',
              },
            ],
          }),
        }}
      />
      <InflationCalculatorPage />
    </ToolPageShell>
  );
}
