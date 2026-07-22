import { buildToolJsonLd } from '@/lib/seo-tools';
import { getCspNonce } from '@/lib/csp';
import type { ToolEntry } from '@/lib/tools-registry';

type Props = {
  tool: ToolEntry;
};

export default async function ToolStructuredData({ tool }: Props) {
  const nonce = await getCspNonce();
  const jsonLd = buildToolJsonLd(tool);

  return (
    <script
      id={`tool-structured-data-${tool.id}`}
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
