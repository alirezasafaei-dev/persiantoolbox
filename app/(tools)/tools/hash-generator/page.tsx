import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const HashGenerator = dynamic(() =>
  import('@/components/features/text-tools/HashGenerator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/hash-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function HashGeneratorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <HashGenerator />
    </ToolPageShell>
  );
}
