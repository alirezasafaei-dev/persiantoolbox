import ExtractTextPage from '@/features/pdf-tools/extract/extract-text';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/extract/extract-text');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ExtractTextRoute() {
  return (
    <div className="space-y-10">
      <ExtractTextPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
