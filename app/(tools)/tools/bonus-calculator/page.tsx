import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';

const BonusCalculator = dynamic(() =>
  import('@/components/features/finance/BonusCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/bonus-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function BonusCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="bonus-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه عیدی و پاداش پایان سال',
            description: 'راهنمای گام به گام محاسبه عیدی و پاداش پایان سال کاری بر اساس قانون کار',
            step: [
              {
                '@type': 'HowToStep',
                name: 'حقوق پایه ماهانه را وارد کنید',
                text: 'حقوق پایه یا آخرین حقوق دریافتی ماهانه را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تعداد روزهای کارکرد را مشخص کنید',
                text: 'تعداد روزهای کارکرد در سال را وارد کنید (حداکثر ۳۶۵ روز)',
              },
              {
                '@type': 'HowToStep',
                name: 'سقف عیدی را بررسی کنید',
                text: 'سقف عیدی سالانه (حداکثر ۲ برابر حداقل حقوق) طبق اعلام وزارت کار لحاظ می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'مبلغ عیدی و پاداش را مشاهده کنید',
                text: 'مبلغ عیدی و پاداش پایان سال بر اساس فرمول قانونی محاسبه و نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب عیدی و پاداش پایان سال',
              url: 'https://persiantoolbox.ir/tools/bonus-calculator',
            },
          }),
        }}
      />
      <BonusCalculator />
      <FinancialTransparencyBox
        calculationName="محاسبه‌گر عیدی"
        formulaSummary="حداقل ۲ برابر حقوق پایه (سقف ۹۰ روز حداقل حقوق)"
        dataSource="قانون کار - ماده ۹۱"
      />
    </ToolPageShell>
  );
}
