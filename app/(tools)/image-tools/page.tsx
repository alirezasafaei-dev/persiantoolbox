import Link from 'next/link';
import dynamic from 'next/dynamic';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const ImageToolsPage = dynamic(
  () => import('@/features/image-tools/image-tools').then((module) => module.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/image-tools');
const categoryContent = getCategoryContent('image-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function ImageToolsRoute() {
  return (
    <div className="space-y-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تصویر', url: `${siteUrl}/image-tools` },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
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
      <ImageToolsPage />
      {categoryContent ? (
        <CategoryGuideSection categoryContent={categoryContent} guideTitle="راهنمای موضوعی تصویر" />
      ) : null}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
