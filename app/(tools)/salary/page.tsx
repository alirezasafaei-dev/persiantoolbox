import SalaryPage from '@/components/features/salary/SalaryPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import FinanceTrustBlock from '@/components/features/finance/FinanceTrustBlock';
import RelatedFinanceTools from '@/components/features/finance/RelatedFinanceTools';

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
