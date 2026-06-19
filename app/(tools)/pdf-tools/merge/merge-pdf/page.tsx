import dynamic from 'next/dynamic';
const DynamicMergePdfPage = dynamic(() => import('@/features/pdf-tools/merge/merge-pdf').then(m => m.default), { ssr: false });
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/merge/merge-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function MergePdfRoute() {
  return (
    <div className="space-y-10">
      <DynamicMergePdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-merge" />
      </div>
      <ToolSeoContent tool={tool} />
    </div>
  );
}
