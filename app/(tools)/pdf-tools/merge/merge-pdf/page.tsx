import dynamic from 'next/dynamic';
const DynamicMergePdfPage = dynamic(() =>
  import('@/features/pdf-tools/merge/merge-pdf').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/merge/merge-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function MergePdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicMergePdfPage />
    </ToolPageShell>
  );
}
