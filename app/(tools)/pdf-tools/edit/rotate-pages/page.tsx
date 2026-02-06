import RotatePagesPage from '@/features/pdf-tools/edit/rotate-pages';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/edit/rotate-pages');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function RotatePagesRoute() {
  return (
    <div className="space-y-10">
      <RotatePagesPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
