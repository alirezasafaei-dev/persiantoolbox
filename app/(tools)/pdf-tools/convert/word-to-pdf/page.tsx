import WordToPdfPage from '@/features/pdf-tools/convert/word-to-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/word-to-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function WordToPdfRoute() {
  return (
    <div className="space-y-10">
      <WordToPdfPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
