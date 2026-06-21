import dynamic from 'next/dynamic';
const DynamicDeletePagesPage = dynamic(() =>
  import('@/features/pdf-tools/edit/delete-pages').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/edit/delete-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function DeletePagesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicDeletePagesPage />
    </ToolPageShell>
  );
}
