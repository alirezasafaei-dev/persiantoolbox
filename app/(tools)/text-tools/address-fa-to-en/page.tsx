import AddressFaToEnTool from '@/components/features/text-tools/AddressFaToEnTool';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/address-fa-to-en');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddressFaToEnRoute() {
  return (
    <div className="space-y-10">
      <AddressFaToEnTool />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
