import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const RealPurchasingPower = dynamic(
  () => import('@/components/features/finance/RealPurchasingPower').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/real-purchasing-power');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RealPurchasingPowerRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/finance-tools` },
          { name: 'محاسبه قدرت خرید واقعی' },
        ]}
      />
      <Script
        id="real-purchasing-power-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه قدرت خرید واقعی',
            description: 'راهنمای گام به گام محاسبه اثر تورم بر قدرت خرید حقوق',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ حقوق فعلی را وارد کنید',
                text: 'مبلغ حقوق یا درآمد ماهانه فعلی خود را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نرخ تورم را وارد کنید',
                text: 'نرخ تورم مورد نظر (مثلاً سالانه یا ماهانه) را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مدت زمان را مشخص کنید',
                text: 'بازه زمانی مورد نظر برای محاسبه تورم را تعیین کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'میزان کاهش قدرت خرید و افزایش لازم برای حفظ ارزش را ببینید',
              },
            ],
          }),
        }}
      />
      <RealPurchasingPower />
    </ToolPageShell>
  );
}
