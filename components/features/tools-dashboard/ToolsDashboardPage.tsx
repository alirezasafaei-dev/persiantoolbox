'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, EmptyState } from '@/components/ui';
import PageHero from '@/shared/ui/PageHero';
import { getCategories, getIndexableTools } from '@/lib/tools-registry';

const iconByCategory: Record<string, string> = {
  'pdf-tools': '📄',
  'image-tools': '🖼️',
  'date-tools': '📅',
  'text-tools': '✍️',
  'finance-tools': '💰',
  'validation-tools': '✅',
  'contract-tools': '📑',
  'business-tools': '💼',
  'career-tools': '🎯',
  'writing-tools': '📝',
  'seo-tools': '🔎',
};

const allTools = getIndexableTools()
  .filter((tool) => tool.kind === 'tool')
  .map((tool) => ({
    id: tool.id,
    title: tool.title.replace(' - جعبه ابزار فارسی', ''),
    description: tool.description,
    path: tool.path,
    categoryId: tool.category?.id ?? 'other',
    categoryName: tool.category?.name ?? 'سایر ابزارها',
    icon: iconByCategory[tool.category?.id ?? ''] ?? '🛠️',
  }));

const categoryOptions = [
  { id: 'all', name: 'همه ابزارها', icon: '🧰' },
  ...getCategories()
    .filter((category) => allTools.some((tool) => tool.categoryId === category.id))
    .map((category) => ({
      id: category.id,
      name: category.name,
      icon: iconByCategory[category.id] ?? '🛠️',
    })),
];

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('fa-IR').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
}

export default function ToolsDashboardPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [query, setQuery] = useState('');

  const filteredTools = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    return allTools.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.categoryId === selectedCategory;
      const searchable = normalizeSearch(`${tool.title} ${tool.description} ${tool.categoryName}`);
      const matchesSearch = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [query, selectedCategory]);

  return (
    <div className="min-w-0 space-y-10 overflow-x-hidden">
      <PageHero
        title="همه ابزارهای آنلاین رایگان فارسی"
        description="ابزارهای PDF، متن، تصویر، تاریخ، محاسبات مالی، اعتبارسنجی و اسناد؛ بدون نصب نرم‌افزار و با دسترسی مستقیم."
        gradient="primary"
        badges={[
          { text: `${allTools.length} ابزار قابل استفاده`, color: 'primary' },
          { text: 'بدون ثبت‌نام اجباری', color: 'success' },
          { text: 'پردازش محلی در ابزارهای پشتیبانی‌شده', color: 'info' },
        ]}
      />

      <section className="min-w-0 rounded-lg border border-(--border-light) bg-(--surface-1) p-5">
        <label
          htmlFor="tools-search"
          className="mb-2 block text-sm font-bold text-(--text-primary)"
        >
          جست‌وجوی ابزار
        </label>
        <input
          id="tools-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="مثلاً PDF، محاسبه حقوق، تبدیل تاریخ یا کد ملی"
          className="min-w-0 w-full rounded-md border border-(--border-light) bg-(--surface-2) px-4 py-3 text-(--text-primary) outline-hidden transition-colors placeholder:text-(--text-muted) focus:border-primary"
        />
        <p className="mt-2 text-xs text-(--text-muted)" aria-live="polite">
          {filteredTools.length} ابزار نمایش داده می‌شود.
        </p>
      </section>

      <nav aria-label="دسته‌بندی ابزارها" className="flex min-w-0 max-w-full flex-wrap gap-2">
        {categoryOptions.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            aria-pressed={selectedCategory === category.id}
            className={`max-w-full wrap-break-word rounded-full px-4 py-2 text-sm font-semibold whitespace-normal transition-all duration-(--motion-fast) ${
              selectedCategory === category.id
                ? 'bg-primary text-(--text-inverted) shadow-medium'
                : 'border border-(--border-light) bg-(--surface-1) text-(--text-primary) hover:bg-(--bg-subtle)'
            }`}
          >
            <span className="ms-2" aria-hidden="true">
              {category.icon}
            </span>
            {category.name}
          </button>
        ))}
      </nav>

      {filteredTools.length > 0 ? (
        <section
          aria-label="فهرست ابزارها"
          className="grid min-w-0 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="group min-w-0 h-full transition-all duration-(--motion-medium) hover:-translate-y-1 hover:shadow-strong"
            >
              <Link
                href={tool.path}
                className="flex min-w-0 h-full flex-col p-6"
                aria-label={`استفاده از ${tool.title}`}
              >
                <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                  <span className="shrink-0 text-3xl" aria-hidden="true">
                    {tool.icon}
                  </span>
                  <span className="min-w-0 wrap-break-word rounded-full bg-(--surface-2) px-2 py-1 text-[10px] font-semibold text-(--text-muted)">
                    {tool.categoryName}
                  </span>
                </div>
                <h2 className="wrap-break-word text-lg font-black text-(--text-primary) transition-colors group-hover:text-primary">
                  {tool.title}
                </h2>
                <p className="mt-2 min-w-0 flex-1 wrap-break-word text-sm leading-7 text-(--text-muted)">
                  {tool.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-bold text-primary">
                  بازکردن ابزار
                  <svg
                    className="me-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                </span>
              </Link>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          icon="🔍"
          title="ابزاری پیدا نشد"
          description="عبارت جست‌وجو یا دسته‌بندی را تغییر دهید."
          action={{
            label: 'پاک‌کردن فیلترها',
            onClick: () => {
              setQuery('');
              setSelectedCategory('all');
            },
          }}
        />
      )}
    </div>
  );
}
