import dynamic from 'next/dynamic';
const DynamicExtractTextPage = dynamic(() => import('@/features/pdf-tools/extract/extract-text').then(m => m.default), { ssr: false });
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/extract/extract-text');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ExtractTextRoute() {
  return (
    <div className="space-y-10">
      <DynamicExtractTextPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-extract-extract-text" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
