import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const BonusCalculator = dynamic(() =>
  import('@/components/features/finance/BonusCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/bonus-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function BonusCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <BonusCalculator />
    </ToolPageShell>
  );
}
