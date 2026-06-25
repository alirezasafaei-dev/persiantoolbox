import Script from 'next/script';
import RotateImagePage from '@/components/features/image-tools/RotateImage';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/rotate-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function RotateImageRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تصویر', url: `${siteUrl}/image-tools` },
          { name: 'چرخش تصویر' },
        ]}
      />
      <Script
        id="rotate-image-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه چرخش تصویر',
            description: 'راهنمای گام به گام چرخش تصویر با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تصویر',
                text: 'تصویر مورد نظر خود را از کامپیوتر یا گوشی بارگذاری کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'انتخاب زاویه چرخش',
                text: 'زاویه چرخش مانند ۹۰ درجه، ۱۸۰ درجه یا دلخواه را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'دانلود',
                text: 'تصویر چرخش یافته را دانلود کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'چرخش تصویر',
              url: `${siteUrl}/image-tools/rotate-image`,
            },
          }),
        }}
      />
      <RotateImagePage />
    </ToolPageShell>
  );
}
