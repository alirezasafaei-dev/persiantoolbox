import ExtractPagesPage from '@/features/pdf-tools/extract/extract-pages';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/extract/extract-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ExtractPagesRoute() {
  return (
    <div className="space-y-10">
      <ExtractPagesPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-extract-extract-pages" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
