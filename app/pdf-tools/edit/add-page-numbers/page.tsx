import AddPageNumbersPage from '@/features/pdf-tools/paginate/add-page-numbers';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

const tool = getToolWithMetadataOverride('/pdf-tools/edit/add-page-numbers');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddPageNumbersRoute() {
  return (
    <ToolPageShell tool={tool}>
      <AddPageNumbersPage />
    </ToolPageShell>
  );
}
