import LivingCostPage from '@/components/features/finance/LivingCost';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <LivingCostPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
