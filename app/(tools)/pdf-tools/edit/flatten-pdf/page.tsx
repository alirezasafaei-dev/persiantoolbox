import dynamic from 'next/dynamic';
const DynamicFlattenPdfPage = dynamic(() => import('@/components/features/pdf-tools/flatten-pdf').then(m => m.default), { ssr: false });
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/edit/flatten-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function FlattenPdfRoute() {
  return (
    <div className="space-y-10">
      <DynamicFlattenPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-edit-flatten-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
