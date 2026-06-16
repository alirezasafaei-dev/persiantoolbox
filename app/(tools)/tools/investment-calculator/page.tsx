import InvestmentCalculatorPage from '@/components/features/finance/investment-calculator';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
      <ToolSeoContent tool={tool} />
    </div>
  );
}
