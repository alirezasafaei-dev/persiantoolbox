import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const ExtractInfoPage = dynamic(
  () => import('@/components/features/text-tools/ExtractInfo').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/text-tools/extract-info');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ExtractInfoRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'استخراج اطلاعات' },
        ]}
      />
      <Script
        id="extract-info-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه استخراج اطلاعات از متن',
            description: 'راهنمای گام به گام استخراج اطلاعات از متن',
            step: [
              {
                '@type': 'HowToStep',
                name: 'وارد کردن متن',
                text: 'متن مورد نظر خود را در کادر وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده اطلاعات استخراج شده',
                text: 'اطلاعات استخراج شده مانند ایمیل، شماره تلفن، لینک و ... را مشاهده کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'استخراج اطلاعات',
              url: `${siteUrl}/text-tools/extract-info`,
            },
          }),
        }}
      />
      <ExtractInfoPage />
    </ToolPageShell>
  );
}
