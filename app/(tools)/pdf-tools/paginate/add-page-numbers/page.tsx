import AddPageNumbersPage from '@/features/pdf-tools/paginate/add-page-numbers';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <AddPageNumbersPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
