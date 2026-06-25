import Script from 'next/script';
import CheckPenaltyCalculator from '@/components/features/finance/CheckPenaltyCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
