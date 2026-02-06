import ImageToPdfPage from '@/features/pdf-tools/convert/image-to-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/image-to-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageToPdfRoute() {
  return (
    <div className="space-y-10">
      <ImageToPdfPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
