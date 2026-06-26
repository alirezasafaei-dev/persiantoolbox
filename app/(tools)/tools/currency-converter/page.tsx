import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const CurrencyConverterPage = dynamic(
  () => import('@/components/features/finance/currency-converter').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/currency-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function CurrencyConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="currency-converter-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل نرخ ارز با ماشین‌حساب ارز',
            description: 'راهنمای گام به گام تبدیل نرخ ارزهای مختلف به ریال و تومان',
            step: [
              {
                '@type': 'HowToStep',
                name: 'ارز مبدأ و مقصد را انتخاب کنید',
                text: 'از لیست ارزها، ارز مبدأ (مثلاً دلار آمریکا) و ارز مقصد (ریال یا تومان) را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مبلغ مورد نظر را وارد کنید',
                text: 'مبلغی که می‌خواهید تبدیل کنید را در کادر ورودی تایپ کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نرخ تبدیل و نتیجه را مشاهده کنید',
                text: 'نرخ لحظه‌ای ارز و مبلغ تبدیل شده بلافاصله نمایش داده می‌شود',
              },
            ],
          }),
        }}
      />
      <CurrencyConverterPage />
    </ToolPageShell>
  );
}
