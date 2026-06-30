import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const HashGenerator = dynamic(
  () => import('@/components/features/text-tools/HashGenerator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/hash-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function HashGeneratorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای مالی', url: `${siteUrl}/tools` },
          { name: 'تولید هش' },
        ]}
      />
      <Script
        id="hash-generator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تولید هش رمز عبور و متن',
            description: 'راهنمای گام به گام تولید هش MD5، SHA-1 و SHA-256 برای رمزگذاری متن',
            step: [
              {
                '@type': 'HowToStep',
                name: 'متن یا رمز عبور را وارد کنید',
                text: 'متنی که می‌خواهید هش شود را در کادر ورودی تایپ کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'الگوریتم هش را انتخاب کنید',
                text: 'یکی از الگوریتم‌های MD5، SHA-1 یا SHA-256 را متناسب با نیاز خود انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'هش تولید شده را کپی کنید',
                text: 'کد هش یکتا تولید شده را کپی کنید و در پروژه خود استفاده نمایید',
              },
            ],
          }),
        }}
      />
      <HashGenerator />
    </ToolPageShell>
  );
}
