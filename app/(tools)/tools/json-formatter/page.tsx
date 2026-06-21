import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const JsonFormatter = dynamic(() =>
  import('@/components/features/text-tools/JsonFormatter').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/json-formatter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function JsonFormatterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <JsonFormatter />
    </ToolPageShell>
  );
}
