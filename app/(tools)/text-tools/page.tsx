import Link from 'next/link';
import Script from 'next/script';
import TextToolsPage from '@/components/features/text-tools/TextToolsPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/text-tools');
const categoryContent = getCategoryContent('text-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function TextToolsRoute() {
  return (
    <div className="space-y-10">
      <Script
        id="text-tools-breadcrumb-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://persiantoolbox.ir' },
              { '@type': 'ListItem', position: 2, name: 'ابزارهای متنی' },
            ],
          }),
        }}
      />
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Link
          href="/topics"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
        >
          <svg
            className="h-4 w-4 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به همه ابزارها
        </Link>
      </div>
      <TextToolsPage />
      {categoryContent && (
        <CategoryGuideSection categoryContent={categoryContent} guideTitle="راهنمای موضوعی متن" />
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
