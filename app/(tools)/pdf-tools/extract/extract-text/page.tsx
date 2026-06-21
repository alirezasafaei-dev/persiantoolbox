import dynamic from 'next/dynamic';
const DynamicExtractTextPage = dynamic(() =>
  import('@/features/pdf-tools/extract/extract-text').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/extract/extract-text');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ExtractTextRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicExtractTextPage />
    </ToolPageShell>
  );
}
