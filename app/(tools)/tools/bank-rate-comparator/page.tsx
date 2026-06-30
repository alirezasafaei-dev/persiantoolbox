import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const BankRateComparatorPage = dynamic(
  () => import('@/components/features/finance/BankRateComparator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/bank-rate-comparator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function BankRateComparatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'مقایسه نرخ سود بانکی' },
        ]}
      />
      <Script
        id="bank-rate-comparator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه مقایسه نرخ سود بانکی',
            description: 'راهنمای گام به گام مقایسه نرخ سود سپرده‌های بانکی مختلف',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ سپرده را وارد کنید',
                text: 'مبلغی که قصد دارید در بانک سپرده‌گذاری کنید را وارد نمایید',
              },
              {
                '@type': 'HowToStep',
                name: 'دوره سپرده‌گذاری را انتخاب کنید',
                text: 'مدت زمان سپرده‌گذاری (کوتاه‌مدت، میان‌مدت یا بلندمدت) را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'بانک‌ها را مقایسه کنید',
                text: 'نرخ سود پیشنهادی بانک‌های مختلف را در جدول مقایسه ببینید',
              },
              {
                '@type': 'HowToStep',
                name: 'بهترین گزینه را انتخاب کنید',
                text: 'بیشترین سود قابل دریافت و بانک مناسب را شناسایی کنید',
              },
            ],
          }),
        }}
      />
      <BankRateComparatorPage />
    </ToolPageShell>
  );
}
