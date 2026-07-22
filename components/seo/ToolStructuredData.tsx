import { buildToolJsonLd } from '@/lib/seo-tools';
import { getCspNonce } from '@/lib/csp';
import type { ToolEntry } from '@/lib/tools-registry';

type Props = {
  tool: ToolEntry;
};

type JsonLdNode = Record<string, unknown>;

const BASE_TOOL_ENTITY_TYPES = new Set(['BreadcrumbList', 'SoftwareApplication', 'WebApplication']);

export default async function ToolStructuredData({ tool }: Props) {
  const nonce = await getCspNonce();
  const source = buildToolJsonLd(tool) as JsonLdNode;
  const sourceGraph = Array.isArray(source['@graph']) ? (source['@graph'] as JsonLdNode[]) : [];
  const graph = sourceGraph.filter((node) => BASE_TOOL_ENTITY_TYPES.has(String(node['@type'])));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
  const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <script
      id={`tool-structured-data-${tool.id}`}
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
