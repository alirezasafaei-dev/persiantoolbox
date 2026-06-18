import ImageToQRPage from '@/components/features/validation-tools/ImageToQR';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/validation-tools/image-to-qr');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ImageToQRRoute() {
  return (
    <div className="space-y-10">
      <ImageToQRPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="validation-tools-image-to-qr" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
