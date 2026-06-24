import ProfitMarginCalculator from '@/components/features/finance/ProfitMarginCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/profit-margin');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ProfitMarginRoute() {
  return (
    <ToolPageShell tool={tool}>
      <ProfitMarginCalculator />
    </ToolPageShell>
  );
}
