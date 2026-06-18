import InvestmentCalculatorPage from '@/components/features/finance/investment-calculator';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/tools/investment-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InvestmentCalculatorRoute() {
  return (
    <div className="space-y-10">
      <InvestmentCalculatorPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="tools-investment-calculator" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
