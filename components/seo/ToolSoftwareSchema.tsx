import Script from 'next/script';
import type { ToolEntry } from '@/lib/tools-registry';
import { siteUrl } from '@/lib/seo';

type Props = {
  tool: ToolEntry;
};

export default function ToolSoftwareSchema({ tool }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title.replace(' - جعبه ابزار فارسی', ''),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    url: `${siteUrl}${tool.path}`,
    description: tool.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IRR',
    },
  };

  return (
    <Script
      id={`tool-schema-${tool.id}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
