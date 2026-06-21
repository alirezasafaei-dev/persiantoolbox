import TextOnImagePage from '@/components/features/image-tools/TextOnImage';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/text-on-image');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function TextOnImageRoute() {
  return (
    <ToolPageShell tool={tool}>
      <TextOnImagePage />
    </ToolPageShell>
  );
}
