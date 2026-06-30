import dynamic from 'next/dynamic';
import Script from 'next/script';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const ReportGenerator = dynamic(
  () => import('@/components/features/finance/ReportGenerator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/report-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ReportGeneratorPage() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'تولید گزارش' },
        ]}
      />
      <Script
        id="report-generator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه ساخت گزارش مالی',
            description: 'راهنمای گام به گام ساخت گزارش مالی شامل چک، مهریه و بدهی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'نوع گزارش را انتخاب کنید',
                text: 'یکی از انواع گزارش (چک برگشتی، مهریه، بدهی) را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'اطلاعات مربوطه را وارد کنید',
                text: 'اطلاعات خواسته شده مانند مبالغ و تاریخ‌ها را تکمیل کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'گزارش را تولید کنید',
                text: 'روی دکمه تولید گزارش کلیک کنید تا فایل PDF ساخته شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ابزار ساخت گزارش مالی',
              url: `${siteUrl}/tools/[^']*`,
            },
          }),
        }}
      />
      <ReportGenerator />
    </ToolPageShell>
  );
}
