import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const PersianOcr = dynamic(() =>
  import('@/components/features/pdf-tools/PersianOcr').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/persian-ocr');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PersianOcrRoute() {
  return (
    <ToolPageShell tool={tool}>
      <PersianOcr />
    </ToolPageShell>
  );
}
