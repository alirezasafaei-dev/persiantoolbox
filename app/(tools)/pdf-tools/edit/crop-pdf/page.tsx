import CropPdfPage from '@/components/features/pdf-tools/crop-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/edit/crop-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function CropPdfRoute() {
  return (
    <div className="space-y-10">
      <CropPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-edit-crop-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
