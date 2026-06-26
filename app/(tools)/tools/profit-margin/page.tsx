import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const ProfitMarginCalculator = dynamic(
  () => import('@/components/features/finance/ProfitMarginCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/profit-margin');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ProfitMarginRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="profit-margin-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه حاشیه سود',
            description: 'راهنمای گام به گام محاسبه حاشیه سود و نقطه سربه‌سر',
            step: [
              {
                '@type': 'HowToStep',
                name: 'هزینه تمام شده را وارد کنید',
                text: 'هزینه تمام شده تولید یا خرید کالا را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'قیمت فروش یا درصد سود را وارد کنید',
                text: 'قیمت فروش یا درصد سود مورد انتظار را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'حاشیه سود، سود خالص و نقطه سربه‌سر نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب حاشیه سود',
              url: `${siteUrl}/tools/profit-margin`,
            },
          }),
        }}
      />
      <ProfitMarginCalculator />
    </ToolPageShell>
  );
}
