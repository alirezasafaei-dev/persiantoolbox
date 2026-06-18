import ImageToPdfPage from '@/features/pdf-tools/convert/image-to-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/convert/image-to-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageToPdfRoute() {
  return (
    <div className="space-y-10">
      <ImageToPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-convert-image-to-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
