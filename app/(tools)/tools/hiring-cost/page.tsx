import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const HiringCostCalculator = dynamic(
  () => import('@/components/features/finance/HiringCostCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/hiring-cost');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function HiringCostRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="hiring-cost-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه هزینه استخدام',
            description: 'راهنمای گام به گام محاسبه هزینه کل استخدام با احتساب حق بیمه و مزایا',
            step: [
              {
                '@type': 'HowToStep',
                name: 'حقوق پایه را وارد کنید',
                text: 'حقوق ماهانه پایه کارمند را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نوع بیمه را انتخاب کنید',
                text: 'درصد حق بیمه سهم کارفرما (۲۳٪) اعمال می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'مزایا و تسهیلات را مشخص کنید',
                text: 'بن کارگری، عیدی، سنوات و سایر مزایا را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'هزینه کل را مشاهده کنید',
                text: 'هزینه کل استخدام ماهانه و سالانه با تمام اجزا نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب هزینه استخدام',
              url: `${siteUrl}/tools/hiring-cost`,
            },
          }),
        }}
      />
      <HiringCostCalculator />
    </ToolPageShell>
  );
}
