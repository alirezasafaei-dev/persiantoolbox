import dynamic from 'next/dynamic';
const DynamicAddPageNumbersPage = dynamic(() =>
  import('@/features/pdf-tools/paginate/add-page-numbers').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/paginate/add-page-numbers');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddPageNumbersRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicAddPageNumbersPage />
    </ToolPageShell>
  );
}
