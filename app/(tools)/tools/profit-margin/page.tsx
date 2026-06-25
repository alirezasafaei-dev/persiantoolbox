import Script from 'next/script';
import ProfitMarginCalculator from '@/components/features/finance/ProfitMarginCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
