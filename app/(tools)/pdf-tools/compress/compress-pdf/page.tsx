import dynamic from 'next/dynamic';
const DynamicCompressPdfPage = dynamic(() => import('@/features/pdf-tools/compress/compress-pdf').then(m => m.default));
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/compress/compress-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function CompressPdfRoute() {
  return (
    <div className="space-y-10">
      <DynamicCompressPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-compress-compress-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
