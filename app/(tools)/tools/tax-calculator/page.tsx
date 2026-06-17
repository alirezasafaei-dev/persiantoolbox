import TaxCalculatorPage from '@/components/features/finance/TaxCalculator';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
      <ToolSeoContent tool={tool} />
    </div>
  );
}
