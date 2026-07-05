import Link from 'next/link';
import Script from 'next/script';
import ToolCard from '@/shared/ui/ToolCard';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow, getToolsByCategory } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/seo-tools');
const categoryContent = getCategoryContent('seo-tools');
const seoTools = getToolsByCategory('seo-tools');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

function getIconForTool(path: string) {
  if (path.includes('snippet')) {
    return '🔎';
  }
  if (path.includes('meta-description')) {
    return '📝';
  }
  if (path.includes('title-analyzer')) {
    return '📏';
  }
  if (path.includes('heading')) {
    return '📑';
  }
  if (path.includes('canonical')) {
    return '🔗';
  }
  if (path.includes('open-graph')) {
    return '📣';
  }
  if (path.includes('faq-schema')) {
    return '❓';
  }
  if (path.includes('howto')) {
    return '📋';
  }
  if (path.includes('local-business')) {
    return '🏪';
  }
  if (path.includes('robots')) {
    return '🤖';
  }
  if (path.includes('sitemap')) {
    return '🗺️';
  }
  if (path.includes('indexability')) {
    return '✅';
  }
  if (path.includes('redirect')) {
    return '↪️';
  }
  if (path.includes('broken-link')) {
    return '🔗❌';
  }
  if (path.includes('keyword-density')) {
    return '📊';
  }
  return '🔍';
}

export default function SeoToolsRoute() {
  return (
    <div className="space-y-10">
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Link
          href="/topics"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
        >
          ← بازگشت به موضوعات
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            ابزارهای سئو
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1 text-[var(--text-muted)]">
              پردازش کاملاً محلی
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1 text-[var(--text-muted)]">
              بدون ثبت‌نام
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1 text-[var(--text-muted)]">
              رایگان
            </span>
          </div>
        </div>

        {categoryContent?.paragraphs ? (
          <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
            {categoryContent.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seoTools.map((t) => (
            <ToolCard
              key={t.id}
              href={t.path}
              title={t.title.replace(' - جعبه ابزار فارسی', '')}
              description={t.description}
              icon={<span className="text-2xl">{getIconForTool(t.path)}</span>}
            />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">نکته حریم خصوصی:</strong> تمام ابزارهای این
          بخش فقط در مرورگر شما اجرا می‌شوند. هیچ داده‌ای به سرور ارسال یا ذخیره نمی‌شود.
        </div>
      </div>

      <BreadcrumbSchema items={[{ name: 'خانه', url: siteUrl }, { name: 'ابزارهای سئو' }]} />

      <Script
        id="seo-tools-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'ابزارهای سئو',
            description: tool.description,
            numberOfItems: seoTools.length,
            itemListElement: seoTools.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.title.replace(' - جعبه ابزار فارسی', ''),
              url: `${siteUrl}${t.path}`,
            })),
          }),
        }}
      />

      {categoryContent ? (
        <div className="max-w-4xl mx-auto px-4">
          <CategoryGuideSection categoryContent={categoryContent} guideTitle="ابزارهای سئو" />
        </div>
      ) : null}
    </div>
  );
}
