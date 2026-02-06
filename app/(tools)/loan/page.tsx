import LoanPage from '@/components/features/loan/LoanPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/loan');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LoanRoute() {
  return (
    <div className="space-y-10">
      <LoanPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
