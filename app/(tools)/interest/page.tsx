import dynamic from 'next/dynamic';
import FinanceTrustBlock from '@/components/features/finance/FinanceTrustBlock';
import RelatedFinanceTools from '@/components/features/finance/RelatedFinanceTools';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const InterestPage = dynamic(() => import('@/components/features/interest/InterestPage'), {
  loading: () => (
    <div className="animate-pulse h-96 bg-[var(--surface-1)] rounded-[var(--radius-lg)]" />
  ),
});

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
