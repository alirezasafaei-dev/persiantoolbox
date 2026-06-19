import dynamic from 'next/dynamic';
const DynamicDecryptPdfPage = dynamic(() => import('@/features/pdf-tools/security/decrypt-pdf').then(m => m.default));
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

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
      <DynamicDecryptPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-security-decrypt-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
