import ImageToQRPage from '@/components/features/validation-tools/ImageToQR';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/validation-tools/image-to-qr');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function ImageToQRRoute() {
  return (
    <ToolPageShell tool={tool}>
      <ImageToQRPage />
    </ToolPageShell>
  );
}
