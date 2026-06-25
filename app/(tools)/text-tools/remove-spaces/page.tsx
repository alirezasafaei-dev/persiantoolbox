import Script from 'next/script';
import RemoveSpacesPage from '@/components/features/text-tools/RemoveSpaces';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/remove-spaces');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function RemoveSpacesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'حذف فاصله' },
        ]}
      />
      <Script
        id="remove-spaces-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه حذف فاصله‌های اضافی متن',
            description: 'راهنمای گام به گام حذف فاصله‌های اضافی متن',
            step: [
              {
                '@type': 'HowToStep',
                name: 'وارد کردن متن',
                text: 'متن مورد نظر خود را در کادر وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'انتخاب نوع حذف',
                text: 'نوع حذف فاصله مانند فاصله‌های اضافی اول و آخر، فاصله‌های تکراری یا تمام فاصله‌ها را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'کپی نتیجه',
                text: 'متن بدون فاصله اضافی را کپی کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'حذف فاصله',
              url: `${siteUrl}/text-tools/remove-spaces`,
            },
          }),
        }}
      />
      <RemoveSpacesPage />
    </ToolPageShell>
  );
}
