import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const TextOnImagePage = dynamic(
  () => import('@/components/features/image-tools/TextOnImage').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/image-tools/text-on-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function TextOnImageRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تصویر', url: `${siteUrl}/image-tools` },
          { name: 'نوشتن متن روی تصویر' },
        ]}
      />
      <Script
        id="text-on-image-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه نوشتن متن روی تصویر',
            description: 'راهنمای گام به گام اضافه کردن متن به تصویر با جعبه ابزار فارسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'انتخاب تصویر',
                text: 'تصویر مورد نظر خود را از کامپیوتر یا گوشی بارگذاری کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'وارد کردن متن',
                text: 'متن مورد نظر خود را در کادر متن وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'تنظیم فونت و رنگ',
                text: 'فونت، سایز، رنگ و موقعیت متن را تنظیم کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'دانلود',
                text: 'تصویر نهایی با متن اضافه شده را دانلود کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'نوشتن متن روی تصویر',
              url: `${siteUrl}/image-tools/text-on-image`,
            },
          }),
        }}
      />
      <TextOnImagePage />
    </ToolPageShell>
  );
}
