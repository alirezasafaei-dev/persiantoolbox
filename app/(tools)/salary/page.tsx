import dynamic from 'next/dynamic';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import FinanceTrustBlock from '@/components/features/finance/FinanceTrustBlock';
import RelatedFinanceTools from '@/components/features/finance/RelatedFinanceTools';

const SalaryPage = dynamic(() => import('@/components/features/salary/SalaryPage'), {
  loading: () => (
    <div className="animate-pulse h-96 bg-[var(--surface-1)] rounded-[var(--radius-lg)]" />
  ),
});

const tool = getToolByPathOrThrow('/salary');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SalaryRoute() {
  return (
    <div className="space-y-10">
      <SalaryPage />
      <ToolSeoContent tool={tool} />
      <FinanceTrustBlock />
      <RelatedFinanceTools current="salary" />
    </div>
  );
}
