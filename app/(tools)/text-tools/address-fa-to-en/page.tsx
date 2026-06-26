import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const AddressFaToEnTool = dynamic(
  () => import('@/components/features/text-tools/AddressFaToEnTool').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/text-tools/address-fa-to-en');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddressFaToEnRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'ترجمه آدرس فارسی' },
        ]}
      />
      <Script
        id="address-fa-to-en-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه ترجمه آدرس فارسی به انگلیسی',
            description: 'راهنمای گام به گام ترجمه آدرس فارسی به انگلیسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'وارد کردن آدرس فارسی',
                text: 'آدرس فارسی خود را در کادر وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'مشاهده ترجمه انگلیسی',
                text: 'ترجمه انگلیسی آدرس را به صورت خودکار مشاهده کنید',
              },
            ],
            tool: {
              '@type': 'HowToTool',
              name: 'ترجمه آدرس فارسی',
              url: `${siteUrl}/text-tools/address-fa-to-en`,
            },
          }),
        }}
      />
      <AddressFaToEnTool />
    </ToolPageShell>
  );
}
