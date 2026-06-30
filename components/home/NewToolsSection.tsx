import Link from 'next/link';
import { getNewestTools } from '@/lib/tools-registry';

export default function NewToolsSection() {
  const newestTools = getNewestTools(6);

  return (
    <section className="space-y-6" aria-labelledby="newest-heading">
      <div className="flex flex-col gap-2 text-center">
        <h2 id="newest-heading" className="text-2xl font-black text-[var(--text-primary)]">
          ابزارهای جدید
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          جدیدترین ابزارهای اضافه‌شده به جعبه ابزار فارسی
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {newestTools.map((tool, index) => (
          <Link
            key={tool.path}
            href={tool.path}
            className={`group flex items-center gap-4 rounded-[var(--radius-lg)] border bg-[var(--surface-1)] p-4 transition-all duration-200 hover:shadow-[var(--shadow-medium)] ${
              index === 0
                ? 'border-[var(--color-primary)]/40 ring-1 ring-[var(--color-primary)]/20'
                : 'border-[var(--border-light)] hover:border-[var(--color-primary)]'
            }`}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-xl"
              aria-hidden="true"
            >
              {tool.category?.id === 'pdf-tools'
                ? '📄'
                : tool.category?.id === 'image-tools'
                  ? '🖼️'
                  : tool.category?.id === 'finance-tools'
                    ? '💰'
                    : tool.category?.id === 'date-tools'
                      ? '📅'
                      : tool.category?.id === 'text-tools'
                        ? '✏️'
                        : tool.category?.id === 'validation-tools'
                          ? '🔐'
                          : '🔧'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {tool.title.split(' - ')[0]}
                </div>
                {index === 0 && (
                  <span className="rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
                    جدید
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
                {tool.description}
              </div>
            </div>
            <span className="text-[var(--color-primary)] shrink-0" aria-hidden="true">
              ←
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
