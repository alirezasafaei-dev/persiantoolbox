import CheckPenaltyCalculator from '@/components/features/finance/CheckPenaltyCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/check-penalty');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function CheckPenaltyRoute() {
  return (
    <ToolPageShell tool={tool}>
      <CheckPenaltyCalculator />
    </ToolPageShell>
  );
}
