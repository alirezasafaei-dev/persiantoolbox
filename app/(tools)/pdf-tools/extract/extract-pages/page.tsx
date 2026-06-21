import dynamic from 'next/dynamic';
const DynamicExtractPagesPage = dynamic(() =>
  import('@/features/pdf-tools/extract/extract-pages').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/extract/extract-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ExtractPagesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicExtractPagesPage />
    </ToolPageShell>
  );
}
