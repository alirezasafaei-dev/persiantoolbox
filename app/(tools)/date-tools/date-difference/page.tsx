import DateDifferencePage from '@/components/features/date-tools/DateDifference';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/date-tools/date-difference');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function DateDifferenceRoute() {
  return (
    <div className="space-y-10">
      <DateDifferencePage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
