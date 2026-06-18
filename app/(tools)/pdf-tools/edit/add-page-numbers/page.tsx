import AddPageNumbersPage from '@/components/features/pdf-tools/add-page-numbers';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/edit/add-page-numbers');

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
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-edit-add-page-numbers" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
