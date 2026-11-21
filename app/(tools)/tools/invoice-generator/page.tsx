import dynamic from 'next/dynamic';
import { getCspNonce } from '@/lib/csp';
import { buildMetadata } from '@/lib/seo';
import { buildToolJsonLd } from '@/lib/seo-tools';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';
import ToolPageShell from '@/components/ui/ToolPageShell';

const InvoiceGenerator = dynamic(
  () => import('@/components/features/finance/InvoiceGenerator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-(--surface-2)" />
        <div className="h-64 rounded-lg bg-(--surface-2)" />
      </div>
    ),
  },
);

const tool = getToolWithMetadataOverride('/tools/invoice-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default async function InvoiceGeneratorPage() {
  const nonce = await getCspNonce();
  const { '@graph': graph } = buildToolJsonLd(tool);
  const howTo = Array.isArray(graph) ? graph.find((node) => node['@type'] === 'HowTo') : undefined;

  return (
    <ToolPageShell tool={tool} showBreadcrumbs={false}>
      {howTo ? (
        <script
          id="invoice-generator-howto"
          type="application/ld+json"
          nonce={nonce ?? undefined}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ '@context': 'https://schema.org', ...howTo }).replace(
              /</g,
              '\\u003c',
            ),
          }}
        />
      ) : null}
      <InvoiceGenerator />
    </ToolPageShell>
  );
}
