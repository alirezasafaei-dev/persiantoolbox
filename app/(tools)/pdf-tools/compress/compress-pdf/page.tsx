import dynamic from 'next/dynamic';
const DynamicCompressPdfPage = dynamic(
  () => import('@/features/pdf-tools/compress/compress-pdf').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-(--surface-2)" />
        <div className="h-64 rounded-lg bg-(--surface-2)" />
      </div>
    ),
  },
);
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/compress/compress-pdf');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function CompressPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'فشرده‌سازی PDF' },
        ]}
      />
      <DynamicCompressPdfPage />
    </ToolPageShell>
  );
}
