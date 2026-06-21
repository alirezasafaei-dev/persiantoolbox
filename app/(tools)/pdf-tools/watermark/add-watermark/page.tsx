import dynamic from 'next/dynamic';
const DynamicAddWatermarkPage = dynamic(() =>
  import('@/features/pdf-tools/watermark/add-watermark').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/watermark/add-watermark');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddWatermarkRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicAddWatermarkPage />
    </ToolPageShell>
  );
}
