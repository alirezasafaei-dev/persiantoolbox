import Link from 'next/link';
import Script from 'next/script';
import ValidationToolsPageComponent from '@/components/features/validation-tools/ValidationToolsPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow, getToolsByCategory } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/validation-tools');
const categoryContent = getCategoryContent('validation-tools');
const categoryTools = getToolsByCategory('validation-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function ValidationToolsRoute() {
  return (
    <div className="space-y-10">
      <Script
        id="validation-tools-breadcrumb-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://persiantoolbox.ir' },
              { '@type': 'ListItem', position: 2, name: 'ابزارهای اعتبارسنجی' },
            ],
          }),
        }}
      />
      <Script
        id="validation-tools-item-list-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'ابزارهای اعتبارسنجی',
            description: tool.description,
            numberOfItems: categoryTools.length,
            itemListElement: categoryTools.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.title.split(' - ')[0],
              url: `https://persiantoolbox.ir${t.path}`,
            })),
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
      <ValidationToolsPageComponent />
      {categoryContent && (
        <CategoryGuideSection
          categoryContent={categoryContent}
          guideTitle="راهنمای موضوعی اعتبارسنجی"
        />
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
