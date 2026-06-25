import Script from 'next/script';
import TaxCalculatorPage from '@/components/features/finance/TaxCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/tax-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function TaxCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="tax-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه مالیات بر درآمد',
            description:
              'راهنمای گام به گام محاسبه مالیات بر درآمد با استفاده از ماشین‌حساب آنلاین',
            step: [
              {
                '@type': 'HowToStep',
                name: 'درآمد ماهانه خالص را وارد کنید',
                text: 'مبلغ درآمد ماهانه پس از کسر بیمه را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'معافیت مالیاتی را بررسی کنید',
                text: 'سقف معافیت مالیاتی ماهانه (حدود ۱۰ میلیون تومان) را بررسی کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نرخ مالیاتی متناسب را مشاهده کنید',
                text: 'بر اساس جدول پلکانی مالیات، نرخ متناسب با درآمد شما نمایش داده می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'مبلغ مالیات قابل پرداخت و جزئیات محاسبه را مشاهده کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب مالیات بر درآمد',
              url: 'https://persiantoolbox.ir/tools/tax-calculator',
            },
          }),
        }}
      />
      <TaxCalculatorPage />
    </ToolPageShell>
  );
}
