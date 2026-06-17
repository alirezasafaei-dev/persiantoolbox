import dynamic from 'next/dynamic';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import FinanceTrustBlock from '@/components/features/finance/FinanceTrustBlock';
import RelatedFinanceTools from '@/components/features/finance/RelatedFinanceTools';

const LoanPage = dynamic(() => import('@/components/features/loan/LoanPage'), {
  loading: () => (
    <div className="animate-pulse h-96 bg-[var(--surface-1)] rounded-[var(--radius-lg)]" />
  ),
});

const tool = getToolByPathOrThrow('/loan');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LoanRoute() {
  return (
    <div className="space-y-10">
      <LoanPage />
      <ToolSeoContent tool={tool} />
      <FinanceTrustBlock />
      <RelatedFinanceTools current="loan" />
    </div>
  );
}
