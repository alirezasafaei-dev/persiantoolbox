import Script from 'next/script';
import MahrCalculator from '@/components/features/finance/MahrCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
      <Script
        id="mahr-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه مهریه بر اساس شاخص CPI',
            description:
              'راهنمای گام به گام محاسبه مهریه با اعمال شاخص بهای کالا و خدمات مصرفی مطابق ماده ۱۰۸۲ قانون مدنی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'مبلغ مهریه پایه را وارد کنید',
                text: 'مبلغ مهریه تعیین شده در سال عقد را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'سال ثبت عقد را انتخاب کنید',
                text: 'سال ثبت ازدواج را از لیست انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'سال مطالبه را مشخص کنید',
                text: 'سالی که مهریه در آن مطالبه می‌شود را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مبلغ تعدیل شده را مشاهده کنید',
                text: 'مبلغ مهریه بر اساس شاخص CPI و ماده ۱۰۸۲ قانون مدنی محاسبه و نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب مهریه',
              url: `${siteUrl}/tools/mahr-calculator`,
            },
          }),
        }}
      />
      <MahrCalculator />
    </ToolPageShell>
  );
}
