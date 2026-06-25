import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const JsonFormatter = dynamic(
  () => import('@/components/features/text-tools/JsonFormatter').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/json-formatter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function JsonFormatterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'فرمت‌بندی JSON' },
        ]}
      />
      <Script
        id="json-formatter-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه فرمت‌بندی و اعتبارسنجی JSON',
            description: 'راهنمای گام به گام فرمت‌بندی، اعتبارسنجی و فشرده‌سازی JSON',
            step: [
              {
                '@type': 'HowToStep',
                name: 'کد JSON را وارد کنید',
                text: 'متن JSON خود را در کادر ورودی پیست کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'عملیات مورد نظر را انتخاب کنید',
                text: 'فرمت‌بندی (pretty print)، فشرده‌سازی (minify) یا اعتبارسنجی را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را کپی کنید',
                text: 'خروجی فرمت شده یا اعتبارسنجی شده را کپی کنید',
              },
            ],
          }),
        }}
      />
      <JsonFormatter />
    </ToolPageShell>
  );
}
