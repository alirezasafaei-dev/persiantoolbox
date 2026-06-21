import InvestmentCalculatorPage from '@/components/features/finance/investment-calculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
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
    <ToolPageShell tool={tool}>
      <InvestmentCalculatorPage />
    </ToolPageShell>
  );
}
