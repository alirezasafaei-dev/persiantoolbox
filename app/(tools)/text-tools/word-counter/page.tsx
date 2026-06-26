import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const WordCounterPage = dynamic(
  () => import('@/components/features/text-tools/WordCounter').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/text-tools/word-counter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function WordCounterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'شمارشگر کلمات' },
        ]}
      />
      <Script
        id="word-counter-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه شمارش کلمات و کاراکتر',
            description: 'راهنمای گام به گام شمارش کلمات و کاراکتر متن',
            step: [
              {
                '@type': 'HowToStep',
                name: 'وارد کردن متن',
                text: 'متن مورد نظر خود را در کادر وارد کنید یا از کلیپبورد کپی کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده نتایج',
                text: 'تعداد کلمات، کاراکترها، جملات و پاراگراف‌ها را به صورت خودکار مشاهده کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'شمارشگر کلمات',
              url: `${siteUrl}/text-tools/word-counter`,
            },
          }),
        }}
      />
      <WordCounterPage />
    </ToolPageShell>
  );
}
