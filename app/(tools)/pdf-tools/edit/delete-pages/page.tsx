import dynamic from 'next/dynamic';
const DynamicDeletePagesPage = dynamic(() => import('@/features/pdf-tools/edit/delete-pages').then(m => m.default));
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

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
      <DynamicDeletePagesPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-edit-delete-pages" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
