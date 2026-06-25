import Script from 'next/script';
import ImageFormatConverterPage from '@/components/features/image-tools/image-format-converter';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/image-format-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageFormatConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تصویر', url: `${siteUrl}/image-tools` },
          { name: 'تبدیل فرمت تصویر' },
        ]}
      />
      <Script
        id="image-format-converter-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل فرمت تصویر',
            description: 'راهنمای گام به گام تبدیل فرمت تصویر با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تصویر',
                text: 'تصویر مورد نظر خود را از کامپیوتر یا گوشی بارگذاری کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'انتخاب فرمت خروجی',
                text: 'فرمت خروجی مانند PNG، JPEG، WebP یا GIF را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'دانلود',
                text: 'تصویر تبدیل شده را دانلود کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'مبدل فرمت تصویر',
              url: `${siteUrl}/image-tools/image-format-converter`,
            },
          }),
        }}
      />
      <ImageFormatConverterPage />
    </ToolPageShell>
  );
}
