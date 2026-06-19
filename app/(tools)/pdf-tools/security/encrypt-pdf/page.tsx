import dynamic from 'next/dynamic';
const DynamicEncryptPdfPage = dynamic(() => import('@/features/pdf-tools/security/encrypt-pdf').then(m => m.default));
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
      <DynamicEncryptPdfPage />
      <div className="mt-8">
        <PortfolioCTA variant="tool-result" toolId="pdf-tools-security-encrypt-pdf" />
      </div>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
