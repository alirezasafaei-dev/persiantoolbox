import Script from 'next/script';
import BankRateComparatorPage from '@/components/features/finance/BankRateComparator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
