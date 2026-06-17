import CaseConverterPage from '@/components/features/text-tools/CaseConverter';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/case-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function CaseConverterRoute() {
  return (
    <div className="space-y-10">
      <CaseConverterPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
