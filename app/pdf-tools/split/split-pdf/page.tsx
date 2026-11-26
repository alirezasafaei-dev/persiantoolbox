import SplitPdfPage from '@/features/pdf-tools/split/split-pdf';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/pdf-tools/split/split-pdf');

export const metadata = buildMetadata({
  title: 'تقسیم فایل PDF آنلاین به چند بخش | جعبه ابزار فارسی',
  description:
    'فایل PDF را بدون آپلود به چند بخش تقسیم کنید. تعداد صفحات هر بخش را تعیین کنید و همه فایل‌های PDF را یک‌جا در ZIP دانلود کنید.',
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
      <SplitPdfPage />
    </ToolPageShell>
  );
}
