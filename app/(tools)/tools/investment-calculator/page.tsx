import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const InvestmentCalculatorPage = dynamic(
  () => import('@/components/features/finance/investment-calculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/investment-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InvestmentCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="investment-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه سود سرمایه‌گذاری',
            description: 'راهنمای گام به گام محاسبه سود سرمایه‌گذاری با سود مرکب و ساده',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ سرمایه‌گذاری اولیه را وارد کنید',
                text: 'مبلغی که قصد دارید سرمایه‌گذاری کنید را وارد نمایید',
              },
              {
                '@type': 'HowToStep',
                name: 'نرخ سود سالانه را مشخص کنید',
                text: 'درصد نرخ سود سالانه مورد انتظار خود را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مدت زمان سرمایه‌گذاری را تعیین کنید',
                text: 'تعداد سال‌های مورد نظر برای سرمایه‌گذاری را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه و جدول سود را مشاهده کنید',
                text: 'مبلغ نهایی، سود کل و جدول رشد سرمایه خود را ببینید',
              },
            ],
          }),
        }}
      />
      <InvestmentCalculatorPage />
    </ToolPageShell>
  );
}
