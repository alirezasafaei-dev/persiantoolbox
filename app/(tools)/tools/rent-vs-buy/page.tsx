import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const RentVsBuyCalculator = dynamic(() =>
  import('@/components/features/finance/RentVsBuyCalculator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/rent-vs-buy');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RentVsBuyRoute() {
  return (
    <ToolPageShell tool={tool}>
      <RentVsBuyCalculator />
    </ToolPageShell>
  );
}
