import DeletePagesPage from '@/features/pdf-tools/edit/delete-pages';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <DeletePagesPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
