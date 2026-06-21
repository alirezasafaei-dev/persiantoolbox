import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const PersianPasswordGenerator = dynamic(() =>
  import('@/components/features/validation-tools/PersianPasswordGenerator').then((m) => m.default),
);

const tool = getToolByPathOrThrow('/validation-tools/persian-password');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PersianPasswordRoute() {
  return (
    <ToolPageShell tool={tool}>
      <PersianPasswordGenerator />
    </ToolPageShell>
  );
}
