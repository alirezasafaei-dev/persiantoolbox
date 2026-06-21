import LivingCostPage from '@/components/features/finance/LivingCost';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/living-cost');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function LivingCostRoute() {
  return (
    <ToolPageShell tool={tool}>
      <LivingCostPage />
    </ToolPageShell>
  );
}
