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
        id="address-fa-to-en-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'تبدیل آدرس فارسی به انگلیسی',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            url: `${siteUrl}/text-tools/address-fa-to-en`,
            description: 'تبدیل آدرس فارسی به انگلیسی با دقت بالا',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'IRR',
            },
          }),
        }}
      />
      <AddressFaToEnTool />
    </ToolPageShell>
  );
}
