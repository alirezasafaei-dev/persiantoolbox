import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const AddressFaToEnTool = dynamic(
  () => import('@/components/features/text-tools/AddressFaToEnTool').then((module) => module.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse" aria-label="در حال آماده‌سازی تبدیل آدرس">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/text-tools/address-fa-to-en');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function AddressFaToEnRoute() {
  return (
    <ToolPageShell tool={tool}>
      <AddressFaToEnTool />
    </ToolPageShell>
  );
}
