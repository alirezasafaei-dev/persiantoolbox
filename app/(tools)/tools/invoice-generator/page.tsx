import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const InvoiceGenerator = dynamic(() =>
  import('@/components/features/finance/InvoiceGenerator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/invoice-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InvoiceGeneratorPage() {
  return (
    <ToolPageShell tool={tool}>
      <InvoiceGenerator />
    </ToolPageShell>
  );
}
