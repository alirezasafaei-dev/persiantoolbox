import Script from 'next/script';
import ImageToQRPage from '@/components/features/validation-tools/ImageToQR';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/validation-tools/image-to-qr');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ImageToQRRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای اعتبارسنجی', url: `${siteUrl}/validation-tools` },
          { name: 'تولید QR Code از تصویر' },
        ]}
      />
      <Script
        id="image-to-qr-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تولید QR Code از تصویر',
            description: 'راهنمای گام به گام تبدیل تصویر به کد QR با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'تصویر را بارگذاری کنید',
                text: 'تصویر مورد نظر خود را از کامپیوتر یا گوشی آپلود کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'QR Code تولید شده را مشاهده کنید',
                text: 'کد QR از تصویر شما به صورت خودکار تولید می‌شود',
              },
              {
                '@type': 'HowToStep',
                name: 'دانلود کنید',
                text: 'کد QR تولید شده را دانلود و استفاده کنید',
              },
            ],
          }),
        }}
      />
      <ImageToQRPage />
    </ToolPageShell>
  );
}
