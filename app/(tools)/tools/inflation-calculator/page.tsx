import InflationCalculatorPage from '@/components/features/finance/inflation-calculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/inflation-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InflationCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <InflationCalculatorPage />
    </ToolPageShell>
  );
}
