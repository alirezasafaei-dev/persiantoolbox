'use client';

import { getIndexableTools, getCategories } from '@/lib/tools-registry';
import { searchTools } from '@/lib/tool-search';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const categoryIcons: Record<string, string> = {
  'pdf-tools': '📄',
  'image-tools': '🖼️',
  'finance-tools': '💰',
  'date-tools': '📅',
  'text-tools': '✏️',
  'validation-tools': '🔐',
  'contract-tools': '📋',
  'business-tools': '💼',
  'career-tools': '🎯',
  'writing-tools': '✍️',
};

export default function SearchContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const indexableTools = useMemo(() => getIndexableTools(), []);
  const categories = useMemo(() => getCategories(), []);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return searchTools(indexableTools, searchQuery);
  }, [searchQuery, indexableTools]);

  const popularByCategory = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        tools: indexableTools
          .filter((t) => t.kind === 'tool' && t.category?.id === cat.id)
          .slice(0, 3),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [categories, indexableTools]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">جستجوی ابزارها</h1>
        <p className="text-[var(--text-secondary)]">
          نام ابزار، دسته‌بندی یا عملکرد مورد نظرتان را تایپ کنید
        </p>
      </div>

      <div className="relative space-y-4">
        <div className="relative">
          <svg
            className="absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            aria-label="جستجوی ابزارها"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="چه ابزاری نیاز دارید؟ تایپ کنید... (مثال: محاسبه حقوق، PDF، OCR)"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] pr-12 pl-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="پاک کردن جستجو"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {searchQuery && filteredTools.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-6 py-8 text-center">
          <p className="text-[var(--text-secondary)]">نتیجه‌ای برای «{searchQuery}» پیدا نشد</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            لطفاً با کلمات کلیدی دیگری امتحان کنید یا از دسته‌بندی‌های زیر استفاده کنید
          </p>
        </div>
      ) : null}

      {!searchQuery && (
        <div className="space-y-8">
          <section aria-label="جستجوهای پرجستجو" className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">جستجوهای پرجستجو</h2>
            <div className="flex flex-wrap gap-2">
              {[
                'محاسبه وام',
                'تبدیل تاریخ',
                'محاسبه حقوق',
                'فشرده‌سازی PDF',
                'تبدیل اعداد',
                'شمارش کلمات',
                'اعتبارسنجی کد ملی',
                'تولید رمز عبور',
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          <section aria-label="ابزارهای محبوب" className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">ابزارهای محبوب</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {indexableTools.slice(0, 6).map((tool) => (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className="group rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)] transition-all"
                >
                  <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                    {tool.title.replace(' - جعبه ابزار فارسی', '')}
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    {tool.category?.name ?? 'ابزار'}
                  </div>
                  <div className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">
                    {tool.description}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section aria-label="ابزارها بر اساس دسته‌بندی" className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              ابزارها بر اساس دسته‌بندی
            </h2>
            {popularByCategory.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{categoryIcons[cat.id] ?? '🔧'}</span>
                  <Link
                    href={cat.path}
                    className="text-sm font-bold text-[var(--color-primary)] hover:underline"
                  >
                    {cat.name}
                  </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.path}
                      href={tool.path}
                      className="group rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)] transition-all"
                    >
                      <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                        {tool.title.replace(' - جعبه ابزار فارسی', '')}
                      </div>
                      <div className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">
                        {tool.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {filteredTools.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">{filteredTools.length} ابزار پیدا شد</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <Link
                key={tool.path}
                href={tool.path}
                className="group rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)] transition-all"
              >
                <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {tool.title.replace(' - جعبه ابزار فارسی', '')}
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  {tool.category?.name ?? 'ابزار'}
                </div>
                <div className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">
                  {tool.description}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
