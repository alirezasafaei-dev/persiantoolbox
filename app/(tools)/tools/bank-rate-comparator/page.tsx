import BankRateComparatorPage from '@/components/features/finance/BankRateComparator';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/bank-rate-comparator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function BankRateComparatorRoute() {
  return (
    <div className="space-y-10">
      <BankRateComparatorPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
