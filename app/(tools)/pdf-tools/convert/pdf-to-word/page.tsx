import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const PdfToWord = dynamic(() =>
  import('@/features/pdf-tools/convert/pdf-to-word').then((m) => m.default),
{
  loading: () => (
    <div className="space-y-4">
      <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      <div className="h-10 w-48 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-2)]" />
    </div>
  ),
},
);

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-word');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToWordRoute() {
  return (
    <ToolPageShell tool={tool}>
      <PdfToWord />
    </ToolPageShell>
  );
}
