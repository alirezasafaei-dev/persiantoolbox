import FinanceTrustBlock from '@/components/features/finance/FinanceTrustBlock';
import InterestPage from '@/components/features/interest/InterestPage';
import RelatedFinanceTools from '@/components/features/finance/RelatedFinanceTools';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/interest');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InterestRoute() {
  return (
    <div className="space-y-10">
      <InterestPage />
      <ToolSeoContent tool={tool} />
      <FinanceTrustBlock />
      <RelatedFinanceTools current="interest" />
    </div>
  );
}
