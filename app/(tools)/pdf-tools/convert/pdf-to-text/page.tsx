import dynamic from 'next/dynamic';
const DynamicPdfToTextPage = dynamic(() => import('@/features/pdf-tools/convert/pdf-to-text').then(m => m.default));
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

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
      <DynamicPdfToTextPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-convert-pdf-to-text" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
