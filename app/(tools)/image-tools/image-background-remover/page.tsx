import ImageCropTool from '@/components/features/image-tools/image-background-remover';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/image-background-remover');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageCropRoute() {
  return (
    <ToolPageShell tool={tool}>
      <ImageCropTool />
    </ToolPageShell>
  );
}
