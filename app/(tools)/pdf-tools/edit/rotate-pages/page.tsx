import dynamic from 'next/dynamic';
const DynamicRotatePagesPage = dynamic(() => import('@/features/pdf-tools/edit/rotate-pages').then(m => m.default), { ssr: false });
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/edit/rotate-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RotatePagesRoute() {
  return (
    <div className="space-y-10">
      <DynamicRotatePagesPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-edit-rotate-pages" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
