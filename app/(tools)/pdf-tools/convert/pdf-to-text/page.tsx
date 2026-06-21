import dynamic from 'next/dynamic';
const DynamicPdfToTextPage = dynamic(() =>
  import('@/features/pdf-tools/convert/pdf-to-text').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/convert/pdf-to-text');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PdfToTextRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicPdfToTextPage />
    </ToolPageShell>
  );
}
