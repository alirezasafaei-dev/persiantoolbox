import dynamic from 'next/dynamic';
import Script from 'next/script';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const InvoiceGenerator = dynamic(() =>
  import('@/components/features/finance/InvoiceGenerator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/invoice-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InvoiceGeneratorPage() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="invoice-generator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه ساخت فاکتور',
            description: 'راهنمای گام به گام ساخت فاکتور فروش حرفه‌ای',
            step: [
              {
                '@type': 'HowToStep',
                name: 'اطلاعات شرکت را وارد کنید',
                text: 'نام شرکت، آدرس و اطلاعات تماس را تکمیل کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'اقلام فاکتور را اضافه کنید',
                text: 'کالاها یا خدمات به همراه قیمت و تعداد را اضافه کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'فاکتور را تولید کنید',
                text: 'روی دکمه تولید فاکتور کلیک کنید تا فایل PDF حرفه‌ای ساخته شود',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ابزار ساخت فاکتور',
              url: `${siteUrl}/tools/invoice-generator`,
            },
          }),
        }}
      />
      <InvoiceGenerator />
    </ToolPageShell>
  );
}
