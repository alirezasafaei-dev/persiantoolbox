'use client';

import { useMemo, useState } from 'react';
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
  return value
    .trim()
    .toLocaleLowerCase('fa-IR')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک');
}

export default function ToolsDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    <div className="space-y-10">
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

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
        <label htmlFor="tools-search" className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
          جست‌وجوی ابزار
        </label>
        <input
          id="tools-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="مثلاً PDF، محاسبه حقوق، تبدیل تاریخ یا کد ملی"
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)]"
        />
        <p className="mt-2 text-xs text-[var(--text-muted)]" aria-live="polite">
          {filteredTools.length} ابزار نمایش داده می‌شود.
        </p>
      </section>

      <nav aria-label="دسته‌بندی ابزارها" className="flex flex-wrap gap-2">
        {categoryOptions.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            aria-pressed={selectedCategory === category.id}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
              selectedCategory === category.id
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)]'
                : 'border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
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
        <section aria-label="فهرست ابزارها" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="group h-full transition-all duration-[var(--motion-medium)] hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]"
            >
              <Link href={tool.path} className="flex h-full flex-col p-6" aria-label={`استفاده از ${tool.title}`}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {tool.icon}
                  </span>
                  <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
                    {tool.categoryName}
                  </span>
                </div>
                <h2 className="text-lg font-black text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-primary)]">
                  {tool.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-7 text-[var(--text-muted)]">{tool.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-bold text-[var(--color-primary)]">
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
