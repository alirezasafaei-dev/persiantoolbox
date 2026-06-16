import PdfToExcelPage from '@/components/features/pdf-tools/pdf-to-excel';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-excel');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToExcelRoute() {
  return (
    <div className="space-y-10">
      <PdfToExcelPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
