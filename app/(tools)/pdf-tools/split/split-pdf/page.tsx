import dynamic from 'next/dynamic';
const DynamicSplitPdfPage = dynamic(
  () => import('@/features/pdf-tools/split/split-pdf').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/split/split-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function SplitPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicSplitPdfPage />
    </ToolPageShell>
  );
}
