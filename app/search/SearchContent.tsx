'use client';

import { getIndexableTools } from '@/lib/tools-registry';
import { searchTools } from '@/lib/tool-search';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function SearchContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const indexableTools = useMemo(() => getIndexableTools(), []);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return searchTools(indexableTools, searchQuery);
  }, [searchQuery, indexableTools]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">جستجوی ابزارها</h1>
        <p className="text-[var(--text-secondary)]">
          در تمام ابزارهای PDF، مالی، تصویر، متنی و تاریخ جستجو کنید
        </p>
      </div>

      <div className="space-y-4">
        <input
          aria-label="جستجوی ابزارها"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      {searchQuery && filteredTools.length === 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-6 py-8 text-center">
          <p className="text-[var(--text-secondary)]">نتیجه‌ای برای {searchQuery} پیدا نشد</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            لطفاً با کلمات کلیدی دیگری امتحان کنید
          </p>
        </div>
      )}

      {!searchQuery && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-6 py-8 text-center">
          <p className="text-[var(--text-secondary)]">برای جستجو، کلمه کلیدی را وارد کنید</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            می‌توانید نام ابزار، توضیحات یا دسته‌بندی را جستجو کنید
          </p>
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
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="text-sm font-bold text-[var(--text-primary)]">
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
