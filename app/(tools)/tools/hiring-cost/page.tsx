import HiringCostCalculator from '@/components/features/finance/HiringCostCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/hiring-cost');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function HiringCostRoute() {
  return (
    <ToolPageShell tool={tool}>
      <HiringCostCalculator />
    </ToolPageShell>
  );
}
