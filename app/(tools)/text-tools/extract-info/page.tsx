import ExtractInfoPage from '@/components/features/text-tools/ExtractInfo';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/extract-info');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ExtractInfoRoute() {
  return (
    <div className="space-y-10">
      <ExtractInfoPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
