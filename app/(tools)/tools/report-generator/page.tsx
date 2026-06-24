import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const ReportGenerator = dynamic(() =>
  import('@/components/features/finance/ReportGenerator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/tools/report-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ReportGeneratorPage() {
  return (
    <ToolPageShell tool={tool}>
      <ReportGenerator />
    </ToolPageShell>
  );
}
