import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const PersianOcr = dynamic(
  () => import('@/components/features/pdf-tools/PersianOcr').then((m) => m.default),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-10 w-48 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/persian-ocr');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PersianOcrRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'OCR فارسی' },
        ]}
      />
      <Script
        id="persian-ocr-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه استخراج متن فارسی از تصویر',
            description: 'راهنمای گام به گام استخراج خودکار متن فارسی و انگلیسی از تصاویر',
            step: [
              {
                '@type': 'HowToStep',
                name: 'تصویر را بارگذاری کنید',
                text: 'تصویر حاوی متن فارسی یا انگلیسی را از کامپیوتر آپلود کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'زبان متن را انتخاب کنید',
                text: 'زبان متن موجود در تصویر (فارسی یا انگلیسی) را مشخص کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'استخراج متن را شروع کنید',
                text: 'دکمه استخراج را بزنید و منتظر پردازش بمانید',
              },
              {
                '@type': 'HowToStep',
                name: 'متن استخراج شده را کپی کنید',
                text: 'متن استخراج شده از تصویر را کپی و استفاده کنید',
              },
            ],
          }),
        }}
      />
      <PersianOcr />
    </ToolPageShell>
  );
}
