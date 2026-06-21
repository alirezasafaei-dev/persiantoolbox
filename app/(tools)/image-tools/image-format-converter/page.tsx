import ImageFormatConverterPage from '@/components/features/image-tools/image-format-converter';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/image-tools/image-format-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ImageFormatConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <ImageFormatConverterPage />
    </ToolPageShell>
  );
}
