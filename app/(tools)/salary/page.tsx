import dynamic from 'next/dynamic';
import Script from 'next/script';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const SalaryHub = dynamic(() => import('@/components/features/salary/SalaryHub'), {
  loading: () => <div className="animate-pulse h-96 bg-(--surface-1) rounded-lg" />,
});

const tool = getToolByPathOrThrow('/salary');

export const metadata = buildMetadata({
  title: 'تبدیل حقوق ناخالص به خالص ۱۴۰۵ | آنلاین',
  description:
    'حقوق ناخالص را به خالص و حقوق خالص را به ناخالص تبدیل کنید. محاسبه آنلاین حقوق ۱۴۰۵ با بیمه و مالیات، همراه با جزئیات کسورات و دریافتی.',
  keywords: [...(tool.keywords ?? []), 'تبدیل حقوق ناخالص به خالص', 'تبدیل حقوق خالص به ناخالص'],
  path: tool.path,
});

export default function SalaryRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'محاسبه حقوق' },
        ]}
      />
      <Script
        id="salary-calc-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه حقوق خالص',
            description: 'محاسبه حقوق خالص دریافتی با احتساب بیمه و مالیات',
            step: [
              {
                name: 'حقوق پایه و مزایا را وارد کنید',
                text: 'مبلغ حقوق پایه و مزایای جانبی را وارد کنید',
              },
              {
                name: 'درصدهای بیمه و مالیات را مشخص کنید',
                text: 'درصد بیمه و شرایط مالیاتی را انتخاب کنید',
              },
              {
                name: 'حقوق خالص را مشاهده کنید',
                text: 'جزئیات کسورات و حقوق خالص نمایش داده می‌شود',
              },
            ],
          }),
        }}
      />
      <div className="[&_button]:min-h-6 [&_button]:min-w-6">
        <SalaryHub />
      </div>
    </ToolPageShell>
  );
}
