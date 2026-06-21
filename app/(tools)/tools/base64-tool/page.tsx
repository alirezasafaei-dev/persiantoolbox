import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const Base64Tool = dynamic(() =>
  import('@/components/features/text-tools/Base64Tool').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/base64-tool');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function Base64ToolRoute() {
  return (
    <ToolPageShell tool={tool}>
      <Base64Tool />
    </ToolPageShell>
  );
}
