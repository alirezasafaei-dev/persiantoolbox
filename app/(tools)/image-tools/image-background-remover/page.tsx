import Script from 'next/script';
import ImageCropTool from '@/components/features/image-tools/image-background-remover';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/image-background-remover');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageCropRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تصویر', url: `${siteUrl}/image-tools` },
          { name: 'حذف پس‌زمینه تصویر' },
        ]}
      />
      <Script
        id="image-background-remover-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه حذف پس‌زمینه تصویر',
            description: 'راهنمای گام به گام حذف پس‌زمینه تصویر با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تصویر',
                text: 'تصویری که می‌خواهید پس‌زمینه آن حذف شود را بارگذاری کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'پردازش خودکار',
                text: 'ابزار به صورت خودکار پس‌زمینه تصویر را تشخیص و حذف می‌کند',
              },
              {
                '@type': 'HowToStep',
                name: 'دانلود نتیجه',
                text: 'تصویر بدون پس‌زمینه را با فرمت PNG دانلود کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'حذف پس‌زمینه تصویر',
              url: `${siteUrl}/image-tools/image-background-remover`,
            },
          }),
        }}
      />
      <ImageCropTool />
    </ToolPageShell>
  );
}
