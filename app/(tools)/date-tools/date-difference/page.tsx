import DateDifferencePage from '@/components/features/date-tools/DateDifference';
import ToolPageShell from '@/components/ui/ToolPageShell';
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
    <ToolPageShell tool={tool}>
      <DateDifferencePage />
    </ToolPageShell>
  );
}
