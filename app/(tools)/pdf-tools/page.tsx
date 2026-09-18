import dynamic from 'next/dynamic';
import Link from 'next/link';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const DynamicPdfToolsPage = dynamic(
  () => import('@/components/features/pdf-tools/PdfToolsPage').then((module) => module.default),
  {
    loading: () => (
      <div
        className="flex flex-col gap-6 animate-pulse"
        aria-label="در حال آماده‌سازی ابزارهای PDF"
      >
        <div className="h-8 w-48 rounded-lg bg-(--surface-2)" />
        <div className="h-64 rounded-lg bg-(--surface-2)" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/pdf-tools');
const categoryContent = getCategoryContent('pdf-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function PdfToolsRoute() {
  return (
    <div className="space-y-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'همه ابزارها', url: `${siteUrl}/tools` },
          { name: 'ابزارهای PDF', url: `${siteUrl}/pdf-tools` },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-(--color-primary-hover)"
        >
          <svg
            className="h-4 w-4 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به همه ابزارها
        </Link>
      </div>

      <DynamicPdfToolsPage />

      {categoryContent ? (
        <CategoryGuideSection
          categoryContent={categoryContent}
          guideTitle="راهنمای انتخاب ابزار PDF"
        />
      ) : null}

      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-md border border-(--border-light) bg-(--surface-1) p-5 text-sm leading-7 text-(--text-muted)">
          <h2 className="mb-2 text-lg font-bold text-(--text-primary)">
            پردازش محلی و محدودیت فایل
          </h2>
          <p>
            بیشتر ابزارهای PDF فایل را داخل مرورگر پردازش می‌کنند. فایل برای انجام عملیات به سرور
            ارسال نمی‌شود، اما حداکثر حجم قابل پردازش به حافظه دستگاه، مرورگر و پیچیدگی فایل بستگی
            دارد. برای فایل‌های بسیار بزرگ، ابتدا یک نسخه پشتیبان نگه دارید و عملیات را روی دسکتاپ
            انجام دهید.
          </p>
        </div>
      </section>

      <ToolSeoContent tool={tool} />
    </div>
  );
}
