import RemoveSpacesPage from '@/components/features/text-tools/RemoveSpaces';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <RemoveSpacesPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
