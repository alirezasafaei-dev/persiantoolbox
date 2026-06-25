import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const LoanPage = dynamic(() => import('@/components/features/loan/LoanPage'), {
  loading: () => (
    <div className="animate-pulse h-96 bg-[var(--surface-1)] rounded-[var(--radius-lg)]" />
  ),
});

const tool = getToolByPathOrThrow('/loan');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LoanRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="loan-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه اقساط وام',
            description: 'راهنمای گام به گام محاسبه اقساط ماهانه و سود وام بانکی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ وام را وارد کنید',
                text: 'مبلغ درخواستی وام را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مدت بازپرداخت را انتخاب کنید',
                text: 'تعداد اقساط یا مدت زمان بازپرداخت وام را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نوع وام را انتخاب کنید',
                text: 'نوع وام (کوتاه‌مدت، میان‌مدت، بلندمدت) و نرخ سود را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'اقساط را مشاهده کنید',
                text: 'مبلغ قسط ماهانه، سود کل و جزئیات بازپرداخت نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب وام',
              url: 'https://persiantoolbox.ir/loan',
            },
          }),
        }}
      />
      <LoanPage />
    </ToolPageShell>
  );
}
