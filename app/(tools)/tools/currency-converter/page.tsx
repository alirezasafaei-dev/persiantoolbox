import CurrencyConverterPage from '@/components/features/finance/currency-converter';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools/currency-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function CurrencyConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <CurrencyConverterPage />
    </ToolPageShell>
  );
}
