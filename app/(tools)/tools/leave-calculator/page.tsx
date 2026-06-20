import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const LeaveCalculator = dynamic(() =>
  import('@/components/features/finance/LeaveCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/leave-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LeaveCalculatorPage() {
  return (
    <ToolPageShell tool={tool}>
      <LeaveCalculator />
    </ToolPageShell>
  );
}
