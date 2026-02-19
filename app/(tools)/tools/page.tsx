import FinanceTrustBlock from '@/components/features/finance/FinanceTrustBlock';
import RelatedFinanceTools from '@/components/features/finance/RelatedFinanceTools';
import ToolsDashboardPage from '@/components/features/tools-dashboard/ToolsDashboardPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';
import { getCategoryContent, getIndexableTools, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/tools');
const categoryContent = getCategoryContent('finance-tools');
const specializedTools = getIndexableTools()
  .filter((entry) => entry.kind === 'tool')
  .slice(0, 16);

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function ToolsDashboardRoute() {
  return (
    <div className="space-y-10">
      <ToolsDashboardPage />
      <FinanceTrustBlock compact />
      <RelatedFinanceTools current="hub" />
      <section id="specialized-tools" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">ابزارهای تخصصی</h2>
          <p className="text-sm text-[var(--text-muted)]">
            لیست کامل مسیرهای تخصصی قابل استفاده در نسخه فعلی.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {specializedTools.map((entry) => (
            <Link
              key={entry.path}
              href={entry.path}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 hover:border-[var(--border-strong)]"
            >
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {entry.title.replace(' - جعبه ابزار فارسی', '')}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {entry.category?.name ?? 'ابزار'}
              </div>
            </Link>
          ))}
        </div>
      </section>
      {categoryContent && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">راهنمای موضوعی مالی</h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-7">
            {categoryContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {categoryContent.faq.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">سوالات متداول</h3>
              <div className="space-y-3">
                {categoryContent.faq.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3"
                  >
                    <summary className="cursor-pointer text-[var(--text-primary)] font-semibold">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-[var(--text-secondary)] leading-7">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
