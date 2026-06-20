import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const RetirementCalculator = dynamic(() =>
  import('@/components/features/finance/RetirementCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/retirement-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RetirementCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <RetirementCalculator />
    </ToolPageShell>
  );
}
