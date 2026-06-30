import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const Base64Tool = dynamic(
  () => import('@/components/features/text-tools/Base64Tool').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/base64-tool');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function Base64ToolRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'ابزار Base64' },
        ]}
      />
      <Script
        id="base64-tool-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تبدیل متن به Base64 و بالعکس',
            description: 'راهنمای گام به گام رمزگذاری و رمزگشایی Base64 برای متن و فایل',
            step: [
              {
                '@type': 'HowToStep',
                name: 'متن یا رشته مورد نظر را وارد کنید',
                text: 'متن فارسی یا انگلیسی خود را در کادر ورودی تایپ یا کپی کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'عملیات تبدیل را انتخاب کنید',
                text: 'گزینه رمزگذاری (encode) یا رمزگشایی (decode) را متناسب با نیاز خود انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را کپی یا دانلود کنید',
                text: 'خروجی Base64 تولید شده را کپی کنید یا فایل خروجی را دانلود نمایید',
              },
            ],
          }),
        }}
      />
      <Base64Tool />
    </ToolPageShell>
  );
}
