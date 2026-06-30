import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const CheckPenaltyCalculator = dynamic(
  () => import('@/components/features/finance/CheckPenaltyCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/check-penalty');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function CheckPenaltyRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'محاسبه خسارت چک' },
        ]}
      />
      <Script
        id="check-penalty-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه جریمه چک برگشتی',
            description:
              'راهنمای گام به گام محاسبه جریمه چک برگشتی بر اساس ماده ۵۲۲ قانون اجرای احکام مدنی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ چک را وارد کنید',
                text: 'مبلغ اصلی چک برگشتی را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تاریخ صدور و برگشت را مشخص کنید',
                text: 'تاریخ صدور چک و تاریخ برگشت خوردن آن را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'شاخص CPI را بررسی کنید',
                text: 'شاخص بهای کالا و خدمات مصرفی (CPI) بر اساس آخرین اطلاعات مرکز آمار ایران اعمال می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'مبلغ جریمه بر اساس ماده ۵۲۲ و افزایش تورمی محاسبه و نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب جریمه چک برگشتی',
              url: `${siteUrl}/tools/check-penalty`,
            },
          }),
        }}
      />
      <CheckPenaltyCalculator />
    </ToolPageShell>
  );
}
