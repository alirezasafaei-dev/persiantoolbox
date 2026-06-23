import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const PdfToWord = dynamic(() =>
  import('@/features/pdf-tools/convert/pdf-to-word').then((m) => m.default),
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
