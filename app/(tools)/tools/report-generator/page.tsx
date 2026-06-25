import dynamic from 'next/dynamic';
import Script from 'next/script';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const ReportGenerator = dynamic(() =>
  import('@/components/features/finance/ReportGenerator').then((m) => m.default),
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
              url: 'https://persiantoolbox.ir/tools/report-generator',
            },
          }),
        }}
      />
      <ReportGenerator />
    </ToolPageShell>
  );
}
