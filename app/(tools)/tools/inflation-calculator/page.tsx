import InflationCalculatorPage from '@/components/features/finance/inflation-calculator';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <InflationCalculatorPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
