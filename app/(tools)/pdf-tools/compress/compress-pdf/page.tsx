import CompressPdfPage from '@/features/pdf-tools/compress/compress-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

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
      <CompressPdfPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
