import DateConverterPage from '@/components/features/date-tools/DateConverter';
import ToolPageShell from '@/components/ui/ToolPageShell';
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
    <ToolPageShell tool={tool}>
      <DateConverterPage />
    </ToolPageShell>
  );
}
