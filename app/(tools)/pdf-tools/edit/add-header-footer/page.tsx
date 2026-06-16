import AddHeaderFooterPage from '@/components/features/pdf-tools/add-header-footer';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/edit/add-header-footer');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddHeaderFooterRoute() {
  return (
    <div className="space-y-10">
      <AddHeaderFooterPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
