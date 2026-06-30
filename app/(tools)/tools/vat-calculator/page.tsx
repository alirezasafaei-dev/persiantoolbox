import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const VatCalculator = dynamic(
  () => import('@/components/features/finance/VatCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

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
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'محاسبه مالیات بر ارزش افزوده' },
        ]}
      />
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
