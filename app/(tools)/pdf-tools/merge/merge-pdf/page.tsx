import MergePdfPage from '@/features/pdf-tools/merge/merge-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/merge/merge-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function MergePdfRoute() {
  return (
    <div className="space-y-10">
      <MergePdfPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
