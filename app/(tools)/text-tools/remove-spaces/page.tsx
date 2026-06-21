import RemoveSpacesPage from '@/components/features/text-tools/RemoveSpaces';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/remove-spaces');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function RemoveSpacesRoute() {
  return (
    <ToolPageShell tool={tool}>
      <RemoveSpacesPage />
    </ToolPageShell>
  );
}
