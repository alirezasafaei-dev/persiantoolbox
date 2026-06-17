import ResizeImagePage from '@/components/features/image-tools/ResizeImage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/resize-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ResizeImageRoute() {
  return (
    <div className="space-y-10">
      <ResizeImagePage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
