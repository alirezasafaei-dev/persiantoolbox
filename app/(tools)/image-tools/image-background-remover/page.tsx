import ImageBackgroundRemoverPage from '@/components/features/image-tools/image-background-remover';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/image-background-remover');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageBackgroundRemoverRoute() {
  return (
    <div className="space-y-10">
      <ImageBackgroundRemoverPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
