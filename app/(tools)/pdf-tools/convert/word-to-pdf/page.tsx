import dynamic from 'next/dynamic';
const DynamicWordToPdfPage = dynamic(() => import('@/features/pdf-tools/convert/word-to-pdf').then(m => m.default), { ssr: false });
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/convert/word-to-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function WordToPdfRoute() {
  return (
    <div className="space-y-10">
      <DynamicWordToPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-convert-word-to-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
