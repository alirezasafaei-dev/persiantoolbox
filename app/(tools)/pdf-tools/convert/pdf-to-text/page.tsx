import PdfToTextPage from '@/features/pdf-tools/convert/pdf-to-text';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-text');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToTextRoute() {
  return (
    <div className="space-y-10">
      <PdfToTextPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
