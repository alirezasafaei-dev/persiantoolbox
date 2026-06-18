import ExtractInfoPage from '@/components/features/text-tools/ExtractInfo';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/text-tools/extract-info');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ExtractInfoRoute() {
  return (
    <div className="space-y-10">
      <ExtractInfoPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="text-tools-extract-info" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
