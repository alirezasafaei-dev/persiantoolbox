import DateConverterPage from '@/components/features/date-tools/DateConverter';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/date-tools/shamsi-gregorian');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function DateConverterRoute() {
  return (
    <div className="space-y-10">
      <DateConverterPage />
      <ToolSeoContent tool={tool} />
    </div>
  );
}
