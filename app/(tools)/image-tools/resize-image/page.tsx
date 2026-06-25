import Script from 'next/script';
import ResizeImagePage from '@/components/features/image-tools/ResizeImage';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/resize-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ResizeImageRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تصویر', url: `${siteUrl}/image-tools` },
          { name: 'تغییر اندازه تصویر' },
        ]}
      />
      <Script
        id="resize-image-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تغییر اندازه تصویر',
            description: 'راهنمای گام به گام تغییر ابعاد تصویر با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تصویر',
                text: 'تصویر مورد نظر خود را از کامپیوتر یا گوشی بارگذاری کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تنظیم ابعاد',
                text: 'عرض و ارتفاع مورد نظر را به پیکسل یا درصد وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'دانلود',
                text: 'تصویر تغییر اندازه یافته را دانلود کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'تغییر اندازه تصویر',
              url: `${siteUrl}/image-tools/resize-image`,
            },
          }),
        }}
      />
      <ResizeImagePage />
    </ToolPageShell>
  );
}
