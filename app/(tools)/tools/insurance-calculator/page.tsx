import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const InsuranceCalculator = dynamic(() =>
  import('@/components/features/finance/InsuranceCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/insurance-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function InsuranceCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <InsuranceCalculator />
    </ToolPageShell>
  );
}
