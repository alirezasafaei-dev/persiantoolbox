import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const LegalDocumentGenerator = dynamic(() =>
  import('@/components/features/legal/LegalDocumentGenerator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/legal-document-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LegalDocumentGeneratorPage() {
  return (
    <ToolPageShell tool={tool}>
      <LegalDocumentGenerator />
    </ToolPageShell>
  );
}
