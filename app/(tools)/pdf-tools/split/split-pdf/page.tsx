import dynamic from 'next/dynamic';
const DynamicSplitPdfPage = dynamic(
  () => import('@/features/pdf-tools/split/split-pdf').then((m) => m.default),
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

const tool = getToolByPathOrThrow('/pdf-tools/split/split-pdf');

export const metadata = buildMetadata({
  title: 'تقسیم فایل PDF آنلاین رایگان | جعبه ابزار فارسی',
  description:
    'فایل PDF را در مرورگر به چند بخش پشت سر هم تقسیم کنید. تعداد صفحات هر بخش را تعیین کنید و همهٔ فایل‌ها را در قالب ZIP دانلود کنید.',
  keywords: [
    'تقسیم PDF',
    'تقسیم فایل PDF',
    'تقسیم PDF آنلاین',
    'تقسیم فایل PDF آنلاین',
    'split pdf',
  ],
  path: tool.path,
});

export default function SplitPdfRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
          { name: 'تقسیم فایل PDF' },
        ]}
      />
      <DynamicSplitPdfPage />
    </ToolPageShell>
  );
}
