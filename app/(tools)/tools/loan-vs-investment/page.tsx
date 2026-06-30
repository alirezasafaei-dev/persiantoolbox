import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const LoanVsInvestmentCalculator = dynamic(
  () => import('@/components/features/finance/LoanVsInvestmentCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/loan-vs-investment');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LoanVsInvestmentRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'مقایسه وام و سرمایه‌گذاری' },
        ]}
      />
      <Script
        id="loan-vs-investment-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه مقایسه وام و سرمایه‌گذاری',
            description: 'راهنمای گام به گام مقایسه بازپرداخت وام با بازده سرمایه‌گذاری',
            step: [
              {
                '@type': 'HowToStep',
                name: 'اطلاعات وام را وارد کنید',
                text: 'مبلغ وام، نرخ سود و مدت بازپرداخت را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'اطلاعات سرمایه‌گذاری را وارد کنید',
                text: 'مبلغ سرمایه‌گذاری، نرخ بازده مورد انتظار و مدت سرمایه‌گذاری را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'شرایط مقایسه را تعیین کنید',
                text: 'آیا وام را پس‌انداز کرده‌اید یا سرمایه‌گذاری کرده‌اید؟ سناریوی خود را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه مقایسه را مشاهده کنید',
                text: 'سود خالص هر گزینه و توصیه بهینه مالی را ببینید',
              },
            ],
          }),
        }}
      />
      <LoanVsInvestmentCalculator />
    </ToolPageShell>
  );
}
