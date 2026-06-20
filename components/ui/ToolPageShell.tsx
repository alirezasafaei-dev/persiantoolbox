import type { ReactNode } from 'react';
import type { ToolEntry } from '@/lib/tools-registry';
import ToolTrustBlock from '@/components/ui/ToolTrustBlock';
import RelatedTools from '@/components/ui/RelatedTools';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';
import ToolSeoContent from '@/components/seo/ToolSeoContent';

type Props = {
  tool: ToolEntry;
  children: ReactNode;
};

export default function ToolPageShell({ tool, children }: Props) {
  return (
    <div className="space-y-10">
      {children}

      <PortfolioCTA variant="tool-result" toolId={tool.id} />

      {tool.category ? <ToolTrustBlock category={tool.category} /> : null}

      {tool.category ? <RelatedTools currentPath={tool.path} category={tool.category} /> : null}

      <ToolSeoContent tool={tool} />
    </div>
  );
}
