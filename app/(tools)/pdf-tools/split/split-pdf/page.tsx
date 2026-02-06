import SplitPdfPage from '@/features/pdf-tools/split/split-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/split/split-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SplitPdfRoute() {
  return (
    <div className="space-y-10">
      <SplitPdfPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
