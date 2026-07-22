import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicAddPageNumbersPage = dynamic(
  () => import('@/features/pdf-tools/paginate/add-page-numbers').then((module) => module.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse" aria-label="در حال آماده‌سازی ابزار شماره صفحه">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools/edit/add-page-numbers');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddPageNumbersRoute() {
  return (
    <ToolPageShell tool={tool}>
      <DynamicAddPageNumbersPage />
    </ToolPageShell>
  );
}
