import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getIndexableTools } from '@/lib/tools-registry';

type SearchPageProps = {
  searchParams?: Promise<{ q?: string | string[] }>;
};

export const metadata = buildMetadata({
  title: 'جست‌وجوی ابزارها - جعبه ابزار فارسی',
  description: 'جست‌وجو در ابزارهای فارسی، PDF، مالی، تصویر، تاریخ و متن',
  path: '/search',
});

function normalizeQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim().toLocaleLowerCase('fa-IR') ?? '';
}

function buildSearchHaystack(tool: ReturnType<typeof getIndexableTools>[number]): string {
  return [tool.title, tool.description, tool.category?.name, ...(tool.keywords ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('fa-IR');
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalizeQuery(params?.q);
  const tools = getIndexableTools();
  let results = tools.slice(0, 12);

  if (query) {
    results = tools.filter((tool) => buildSearchHaystack(tool).includes(query));
  }

  return (
    <SiteShell containerClassName="py-10">
      <section className="section-surface p-6 md:p-8" aria-labelledby="search-heading">
        <div className="space-y-4">
          <h1 id="search-heading" className="text-3xl font-black text-[var(--text-primary)]">
            جست‌وجوی ابزارها
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            نام ابزار یا کاری که می‌خواهید انجام دهید را وارد کنید؛ مثل «ادغام PDF»، «حقوق»، «تاریخ»
            یا «آدرس».
          </p>
          <form action="/search" className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="tool-search">
              عبارت جست‌وجو
            </label>
            <input
              id="tool-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="جست‌وجو در ابزارها..."
              className="min-h-12 flex-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgb(var(--color-primary-rgb)/0.18)]"
            />
            <button
              type="submit"
              className="min-h-12 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 text-sm font-bold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              جست‌وجو
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8 space-y-4" aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" className="text-xl font-black text-[var(--text-primary)]">
          {query ? `نتایج برای «${query}»` : 'ابزارهای پیشنهادی'}
        </h2>
        {results.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((tool) => (
              <Link
                key={tool.path}
                href={tool.path}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-subtle)] transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
              >
                <div className="text-base font-black text-[var(--text-primary)]">
                  {tool.title.replace(' - جعبه ابزار فارسی', '')}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {tool.description}
                </p>
                {tool.category ? (
                  <div className="mt-3 text-xs font-semibold text-[var(--text-muted)]">
                    {tool.category.name}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-sm text-[var(--text-secondary)]">
            نتیجه‌ای پیدا نشد. عبارت کوتاه‌تر یا نام دسته ابزار را امتحان کنید.
          </div>
        )}
      </section>
    </SiteShell>
  );
}
