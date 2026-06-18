import WordCounterPage from '@/components/features/text-tools/WordCounter';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/text-tools/word-counter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function WordCounterRoute() {
  return (
    <div className="space-y-10">
      <WordCounterPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="text-tools-word-counter" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
