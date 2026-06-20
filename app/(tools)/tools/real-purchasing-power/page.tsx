import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const RealPurchasingPower = dynamic(() =>
  import('@/components/features/finance/RealPurchasingPower').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/real-purchasing-power');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RealPurchasingPowerRoute() {
  return (
    <ToolPageShell tool={tool}>
      <RealPurchasingPower />
    </ToolPageShell>
  );
}
