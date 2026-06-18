import TaxCalculatorPage from '@/components/features/finance/TaxCalculator';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/tools/tax-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function TaxCalculatorRoute() {
  return (
    <div className="space-y-10">
      <TaxCalculatorPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="tools-tax-calculator" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
