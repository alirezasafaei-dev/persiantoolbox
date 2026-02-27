import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import {
  getCategories,
  getCategoryDisplayEntries,
  getDisplayToolsCount,
} from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export const metadata = buildMetadata({
  title: 'ابزارهای تخصصی - جعبه ابزار فارسی',
  description: 'لیست واقعی ابزارهای تخصصی در همه دسته‌بندی‌های جعبه ابزار فارسی',
  path: '/tools/specialized',
});

export default function SpecializedToolsPage() {
  const categories = getCategories();
  const totalToolsCount = getDisplayToolsCount();

  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-4">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">ابزارهای تخصصی</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          در این صفحه لیست واقعی ابزارهای تخصصی را می‌بینید. ابزارها بر اساس دسته‌بندی مرتب شده‌اند
          تا سریع‌تر به ابزار دقیق موردنیاز برسید.
        </p>
        <div className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
          مجموع ابزارها: {toPersianNumbers(totalToolsCount)}
        </div>
      </header>

      <section className="space-y-5">
        {categories.map((category) => {
          const tools = getCategoryDisplayEntries(category.id);
          if (tools.length === 0) {
            return null;
          }

          return (
            <article
              key={category.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 md:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black text-[var(--text-primary)]">{category.name}</h2>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {toPersianNumbers(tools.length)} ابزار
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.path}
                    className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 transition-all duration-[var(--motion-fast)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-subtle)]"
                  >
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {tool.title.replace(' - جعبه ابزار فارسی', '')}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">{tool.description}</div>
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </SiteShell>
  );
}
