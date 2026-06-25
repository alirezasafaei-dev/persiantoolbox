import Script from 'next/script';
import NumberConverterPage from '@/components/features/text-tools/NumberConverter';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/number-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function NumberConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'تبدیل اعداد' },
        ]}
      />
      <Script
        id="number-converter-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل اعداد',
            description: 'راهنمای گام به گام تبدیل اعداد به حروف فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'وارد کردن عدد',
                text: 'عدد مورد نظر خود را در کادر وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'انتخاب نوع تبدیل',
                text: 'نوع تبدیل مانند عدد به حروف فارسی، حروف به عدد یا عدد به حروف انگلیسی را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده نتیجه',
                text: 'نتیجه تبدیل را مشاهده و کپی کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'تبدیل اعداد',
              url: `${siteUrl}/text-tools/number-converter`,
            },
          }),
        }}
      />
      <NumberConverterPage />
    </ToolPageShell>
  );
}
