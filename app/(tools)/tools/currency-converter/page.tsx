import CurrencyConverterPage from '@/components/features/finance/currency-converter';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <CurrencyConverterPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
