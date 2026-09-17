import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const MahrCalculator = dynamic(
  () => import('@/components/features/finance/MahrCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/mahr-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function MahrCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'محاسبه مهریه' },
        ]}
      />
      <Script
        id="mahr-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه مهریه وجه رایج بر اساس شاخص سالانه',
            description:
              'راهنمای گام‌به‌گام محاسبه مهریه وجه رایج با شاخص متوسط سالانه مطابق تبصره ماده ۱۰۸۲ قانون مدنی و آیین‌نامه اجرایی آن',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ مهریه وجه رایج را وارد کنید',
                text: 'مبلغ مهریه مندرج در عقدنامه را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'شاخص سال وقوع عقد را وارد کنید',
                text: 'شاخص متوسط سالانه رسمی مربوط به سال وقوع عقد را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'شاخص سال قبل از پرداخت را وارد کنید',
                text: 'شاخص متوسط سالانه رسمی مربوط به سال قبل از پرداخت را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مبلغ تعدیل‌شده را مشاهده کنید',
                text: 'مبلغ با نسبت شاخص سال قبل از پرداخت به شاخص سال وقوع عقد محاسبه و نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب مهریه وجه رایج',
              url: `${siteUrl}/tools/mahr-calculator`,
            },
          }),
        }}
      />
      <MahrCalculator />
    </ToolPageShell>
  );
}
