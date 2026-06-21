import dynamic from 'next/dynamic';
const DynamicSplitPdfPage = dynamic(() =>
  import('@/features/pdf-tools/split/split-pdf').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/split/split-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SplitPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicSplitPdfPage />
    </ToolPageShell>
  );
}
