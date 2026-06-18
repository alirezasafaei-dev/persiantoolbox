import CaseConverterPage from '@/components/features/text-tools/CaseConverter';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/text-tools/case-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function CaseConverterRoute() {
  return (
    <div className="space-y-10">
      <CaseConverterPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="text-tools-case-converter" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
