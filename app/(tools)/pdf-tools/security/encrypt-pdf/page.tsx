import EncryptPdfPage from '@/features/pdf-tools/security/encrypt-pdf';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const tool = getToolByPathOrThrow('/pdf-tools/security/encrypt-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function EncryptPdfRoute() {
  return (
    <div className="space-y-10">
      <EncryptPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-security-encrypt-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
