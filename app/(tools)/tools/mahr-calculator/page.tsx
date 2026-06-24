import MahrCalculator from '@/components/features/finance/MahrCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/mahr-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function MahrCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <MahrCalculator />
    </ToolPageShell>
  );
}
