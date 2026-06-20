import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const LoanVsInvestmentCalculator = dynamic(() =>
  import('@/components/features/finance/LoanVsInvestmentCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/loan-vs-investment');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LoanVsInvestmentRoute() {
  return (
    <ToolPageShell tool={tool}>
      <LoanVsInvestmentCalculator />
    </ToolPageShell>
  );
}
