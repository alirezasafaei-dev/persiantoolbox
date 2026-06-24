import VatCalculator from '@/components/features/finance/VatCalculator';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/vat-calculator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function VatCalculatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <VatCalculator />
    </ToolPageShell>
  );
}
