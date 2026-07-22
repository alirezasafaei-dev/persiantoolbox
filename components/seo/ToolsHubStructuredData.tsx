import { getCspNonce } from '@/lib/csp';
import { siteName, siteUrl } from '@/lib/seo';
import { getIndexableTools } from '@/lib/tools-registry';

type Props = {
  title: string;
  description: string;
};

export default async function ToolsHubStructuredData({ title, description }: Props) {
  const nonce = await getCspNonce();
  const tools = getIndexableTools().filter((entry) => entry.kind === 'tool');
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/tools#collection`,
      url: `${siteUrl}/tools`,
      name: title,
      description,
      inLanguage: 'fa-IR',
      isPartOf: {
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
      },
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/tools#items`,
      name: 'فهرست ابزارهای آنلاین جعبه ابزار فارسی',
      numberOfItems: tools.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: tools.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.title.replace(' - جعبه ابزار فارسی', ''),
        url: new URL(entry.path, siteUrl).toString(),
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'خانه',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'همه ابزارها',
          item: `${siteUrl}/tools`,
        },
      ],
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
  const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <script
      id="tools-hub-structured-data"
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
