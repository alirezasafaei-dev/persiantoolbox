import NumberConverterPage from '@/components/features/text-tools/NumberConverter';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/number-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function NumberConverterRoute() {
  return (
    <div className="space-y-10">
      <NumberConverterPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
