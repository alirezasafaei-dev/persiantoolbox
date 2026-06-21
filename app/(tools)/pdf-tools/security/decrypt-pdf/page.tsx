import dynamic from 'next/dynamic';
const DynamicDecryptPdfPage = dynamic(() =>
  import('@/features/pdf-tools/security/decrypt-pdf').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/security/decrypt-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function DecryptPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicDecryptPdfPage />
    </ToolPageShell>
  );
}
