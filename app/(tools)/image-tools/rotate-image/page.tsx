import RotateImagePage from '@/components/features/image-tools/RotateImage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/image-tools/rotate-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function RotateImageRoute() {
  return (
    <div className="space-y-10">
      <RotateImagePage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="image-tools-rotate-image" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
