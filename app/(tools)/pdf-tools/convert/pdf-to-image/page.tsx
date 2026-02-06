import PdfToImagePage from '@/features/pdf-tools/convert/pdf-to-image';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToImageRoute() {
  return (
    <div className="space-y-10">
      <PdfToImagePage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
