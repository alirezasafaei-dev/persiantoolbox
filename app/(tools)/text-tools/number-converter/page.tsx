import NumberConverterPage from '@/components/features/text-tools/NumberConverter';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools/number-converter');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function NumberConverterRoute() {
  return (
    <ToolPageShell tool={tool}>
      <NumberConverterPage />
    </ToolPageShell>
  );
}
