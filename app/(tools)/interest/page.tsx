import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const InterestPage = dynamic(() => import('@/components/features/interest/InterestPage'), {
  loading: () => (
    <div className="animate-pulse h-96 bg-[var(--surface-1)] rounded-[var(--radius-lg)]" />
  ),
});

const tool = getToolByPathOrThrow('/interest');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InterestRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'محاسبه سود سپرده' },
        ]}
      />
      <Script
        id="interest-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه سود بانکی',
            description: 'راهنمای گام به گام محاسبه سود سپرده بانکی با نرخ‌های مختلف',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ سپرده را وارد کنید',
                text: 'مبلغ سپرده‌گذاری را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مدت سپرده‌گذاری را انتخاب کنید',
                text: 'مدت زمان سپرده‌گذاری (کوتاه‌مدت، بلندمدت) را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نرخ سود بانکی را وارد کنید',
                text: 'نرخ سود سالانه بانک مورد نظر را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'مبلغ سود قابل دریافت در پایان دوره سپرده‌گذاری نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب سود بانکی',
              url: `${siteUrl}/interest`,
            },
          }),
        }}
      />
      <InterestPage />
    </ToolPageShell>
  );
}
