import Script from 'next/script';
import VatCalculator from '@/components/features/finance/VatCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/vat-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function VatCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="vat-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه مالیات بر ارزش افزوده',
            description: 'راهنمای گام به گام محاسبه مالیات بر ارزش افزوده (VAT) با نرخ‌های مختلف',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ خالص کالا یا خدمات را وارد کنید',
                text: 'قیمت خالص کالا یا خدمات بدون احتساب مالیات را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نرخ مالیات بر ارزش افزوده را انتخاب کنید',
                text: 'یکی از نرخ‌های ۷٪، ۹٪، ۱۰٪ یا ۱۲٪ متناسب با نوع کالا یا خدمات انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مالیات و مبلغ نهایی را مشاهده کنید',
                text: 'مبلغ مالیات بر ارزش افزوده و مجموع قابل پرداخت به همراه جزئیات نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب مالیات بر ارزش افزوده',
              url: `${siteUrl}/tools/[^']*`,
            },
          }),
        }}
      />
      <VatCalculator />
    </ToolPageShell>
  );
}
