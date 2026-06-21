import dynamic from 'next/dynamic';
const DynamicWordToPdfPage = dynamic(() =>
  import('@/features/pdf-tools/convert/word-to-pdf').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/word-to-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function WordToPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicWordToPdfPage />
    </ToolPageShell>
  );
}
