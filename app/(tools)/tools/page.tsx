import FinanceTrustBlock from '@/components/features/finance/FinanceTrustBlock';
import RelatedFinanceTools from '@/components/features/finance/RelatedFinanceTools';
import ToolsDashboardPage from '@/components/features/tools-dashboard/ToolsDashboardPage';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
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
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ابزارهای تخصصی</h2>
          <p className="text-sm text-[var(--text-muted)]">
            لیست کامل مسیرهای تخصصی قابل استفاده در نسخه فعلی.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {specializedTools.map((entry) => (
            <Link
              key={entry.path}
              href={entry.path}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
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
        <CategoryGuideSection categoryContent={categoryContent} guideTitle="راهنمای موضوعی مالی" />
      )}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
