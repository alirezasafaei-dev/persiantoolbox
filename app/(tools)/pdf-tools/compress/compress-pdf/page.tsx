import dynamic from 'next/dynamic';
const DynamicCompressPdfPage = dynamic(() =>
  import('@/features/pdf-tools/compress/compress-pdf').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/compress/compress-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function CompressPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicCompressPdfPage />
    </ToolPageShell>
  );
}
