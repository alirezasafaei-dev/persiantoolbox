import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';

const InsuranceCalculator = dynamic(
  () => import('@/components/features/finance/InsuranceCalculator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/insurance-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InsuranceCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'محاسبه بیمه' },
        ]}
      />
      <Script
        id="insurance-calculator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه محاسبه حق بیمه تأمین اجتماعی',
            description:
              'راهنمای گام به گام محاسبه سهم بیمه‌شده و کارفرما در حق بیمه تأمین اجتماعی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'حقوق پایه ماهانه را وارد کنید',
                text: 'حقوق پایه یا مبلغ توافقی ماهانه را به تومان وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نرخ بیمه را بررسی کنید',
                text: 'سهم بیمه‌شده (۷٪) و سهم کارفرما (۲۳٪) بر اساس آخرین نرخ‌های سازمان تأمین اجتماعی محاسبه می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'جزئیات بیمه را مشاهده کنید',
                text: 'مبلغ حق بیمه سهم بیمه‌شده، سهم کارفرما و مجموع آن‌ها به همراه سایر مزایا نمایش داده می‌شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ماشین‌حساب حق بیمه تأمین اجتماعی',
              url: `${siteUrl}/tools/insurance-calculator`,
            },
          }),
        }}
      />
      <InsuranceCalculator />
      <FinancialTransparencyBox
        calculationName="محاسبه‌گر بیمه"
        formulaSummary="۷٪ سهم کارمند + ۲۳٪ سهم کارفرما"
        dataSource="قانون تأمین اجتماعی، نرخ‌نامه بیمه ۱۴۰۵"
      />
    </ToolPageShell>
  );
}
