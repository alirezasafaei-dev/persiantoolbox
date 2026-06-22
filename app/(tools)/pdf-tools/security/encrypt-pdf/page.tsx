import dynamic from 'next/dynamic';
const DynamicEncryptPdfPage = dynamic(() =>
  import('@/features/pdf-tools/security/encrypt-pdf').then((m) => m.default),
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/security/encrypt-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function EncryptPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicEncryptPdfPage />
    </ToolPageShell>
  );
}
