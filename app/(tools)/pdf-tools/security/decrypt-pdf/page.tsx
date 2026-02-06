import DecryptPdfPage from '@/features/pdf-tools/security/decrypt-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
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
    <div className="space-y-10">
      <DecryptPdfPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
