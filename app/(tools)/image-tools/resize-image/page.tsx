import ResizeImagePage from '@/components/features/image-tools/ResizeImage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

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
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="image-tools-resize-image" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
