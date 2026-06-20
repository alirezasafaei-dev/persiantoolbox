import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const SeveranceCalculator = dynamic(() =>
  import('@/components/features/finance/SeveranceCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/severance-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SeveranceCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <SeveranceCalculator />
    </ToolPageShell>
  );
}
