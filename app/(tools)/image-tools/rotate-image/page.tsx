import RotateImagePage from '@/components/features/image-tools/RotateImage';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/rotate-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function RotateImageRoute() {
  return (
    <ToolPageShell tool={tool}>
      <RotateImagePage />
    </ToolPageShell>
  );
}
