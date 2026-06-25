import Script from 'next/script';
import CaseConverterPage from '@/components/features/text-tools/CaseConverter';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/case-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function CaseConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'تبدیل حروف' },
        ]}
      />
      <Script
        id="case-converter-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل حروف متن',
            description: 'راهنمای گام به گام تبدیل حروف بزرگ و کوچک متن',
            step: [
              {
                '@type': 'HowToStep',
                name: 'وارد کردن متن',
                text: 'متن مورد نظر خود را در کادر وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'انتخاب نوع حروف',
                text: 'نوع تبدیل مانند حروف بزرگ، حروف کوچک یا Title Case را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده نتیجه',
                text: 'متن تبدیل شده را مشاهده و کپی کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'تبدیل حروف',
              url: `${siteUrl}/text-tools/case-converter`,
            },
          }),
        }}
      />
      <CaseConverterPage />
    </ToolPageShell>
  );
}
