import AddWatermarkPage from '@/features/pdf-tools/watermark/add-watermark';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <AddWatermarkPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
