'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '@/shared/ui/Card';
import SearchInput from '@/shared/ui/SearchInput';
import Tag from '@/shared/ui/Tag';
import Toggle from '@/shared/ui/Toggle';
import Button from '@/shared/ui/Button';

type Tool = {
  id: string;
  title: string;
  path: string;
  category: string;
  categoryId: string;
  description: string;
  enabled: boolean;
  tier: string;
  indexable: boolean;
  lastModified: string;
  usage: number;
};

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  'ابزارهای PDF': 'primary',
  'ابزارهای تصویر': 'success',
  'ابزارهای تاریخ': 'warning',
  'ابزارهای متنی': 'default',
  'ابزارهای مالی': 'success',
  'ابزارهای اعتبارسنجی': 'primary',
};

function toCsvRow(values: string[]): string {
  return values
    .map((v) => {
      if (v.includes(',') || v.includes('"') || v.includes('\n')) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    })
    .join(',');
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('همه');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'title' | 'usage' | 'category'>('title');

  useEffect(() => {
    fetch('/api/admin/tools')
      .then((res) => res.json())
      .then((data) => {
        setTools(data.tools ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return ['همه', ...Array.from(cats)];
  }, [tools]);

  const filtered = useMemo(() => {
    const result = tools.filter((t) => {
      const matchSearch =
        t.title.includes(search) || t.path.includes(search) || t.description.includes(search);
      const matchCategory = filterCategory === 'همه' || t.category === filterCategory;
      return matchSearch && matchCategory;
    });

    result.sort((a, b) => {
      if (sortBy === 'usage') {
        return b.usage - a.usage;
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category, 'fa');
      }
      return a.title.localeCompare(b.title, 'fa');
    });

    return result;
  }, [tools, search, filterCategory, sortBy]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const t of filtered) {
          next.delete(t.id);
        }
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const t of filtered) {
          next.add(t.id);
        }
        return next;
      });
    }
  }, [allVisibleSelected, filtered]);

  const toggleTool = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const bulkToggle = useCallback(
    (enabled: boolean) => {
      setTools((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, enabled } : t)));
      setSelectedIds(new Set());
    },
    [selectedIds],
  );

  const toggleSingleTool = useCallback((id: string) => {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  }, []);

  const exportCsv = useCallback(() => {
    const header = toCsvRow([
      'شناسه',
      'عنوان',
      'مسیر',
      'دسته',
      'وضعیت',
      'تعداد استفاده',
      'تاریخ آخرین تغییر',
    ]);
    const rows = filtered.map((t) =>
      toCsvRow([
        t.id,
        t.title,
        t.path,
        t.category,
        t.enabled ? 'فعال' : 'غیرفعال',
        String(t.usage),
        t.lastModified ?? '',
      ]),
    );
    const bom = '\uFEFF';
    const csv = `${bom + header}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tools-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const enabledCount = tools.filter((t) => t.enabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-light)] border-t-[var(--color-primary)]" />
          <p className="text-sm text-[var(--text-muted)]">در حال بارگذاری ابزارها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">مدیریت ابزارها</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {enabledCount} از {tools.length} ابزار فعال است
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="جستجو بر اساس عنوان، مسیر یا توضیحات..."
            className="max-w-sm"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="title">مرتب‌سازی: عنوان</option>
            <option value="usage">مرتب‌سازی: پرکاربردترین</option>
            <option value="category">مرتب‌سازی: دسته‌بندی</option>
          </select>

          <Button variant="secondary" size="sm" onClick={exportCsv}>
            خروجی CSV
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filterCategory === cat
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
              {cat !== 'همه' && (
                <span className="ms-1 opacity-70">
                  ({tools.filter((t) => t.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="flex items-center gap-3 border-[var(--color-primary)]/30 p-3">
          <span className="text-sm text-[var(--text-primary)]">
            {selectedIds.size} ابزار انتخاب شده
          </span>
          <Button size="sm" variant="primary" onClick={() => bulkToggle(true)}>
            فعال‌سازی
          </Button>
          <Button size="sm" variant="danger" onClick={() => bulkToggle(false)}>
            غیرفعال‌سازی
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setSelectedIds(new Set())}>
            لغو انتخاب
          </Button>
        </Card>
      )}

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-[var(--border-medium)] accent-[var(--color-primary)]"
            />
            {allVisibleSelected ? 'لغو انتخاب همه' : 'انتخاب همه'} ({filtered.length})
          </label>
          <span className="text-xs text-[var(--text-muted)]">
            {filtered.length} ابزار نمایش داده شده
          </span>
        </div>

        <div className="space-y-2">
          {filtered.map((tool) => (
            <div
              key={tool.id}
              className={`flex items-center justify-between rounded-[var(--radius-md)] border p-4 transition-colors ${
                selectedIds.has(tool.id)
                  ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5'
                  : 'border-[var(--border-light)] bg-[var(--surface-1)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(tool.id)}
                  onChange={() => toggleTool(tool.id)}
                  className="h-4 w-4 rounded border-[var(--border-medium)] accent-[var(--color-primary)]"
                />
                <Tag variant={categoryColors[tool.category] ?? 'default'}>{tool.category}</Tag>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{tool.title}</h3>
                  <p className="font-mono text-xs text-[var(--text-muted)]" dir="ltr">
                    {tool.path}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[var(--text-muted)]" title="تعداد استفاده">
                  {tool.usage.toLocaleString('fa-IR')} بازدید
                </span>
                <span
                  className={`text-xs font-medium ${
                    tool.indexable ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'
                  }`}
                >
                  {tool.indexable ? 'ایندکس' : 'عدم ایندکس'}
                </span>
                <Toggle checked={tool.enabled} onChange={() => toggleSingleTool(tool.id)} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">هیچ ابزاری یافت نشد</p>
          )}
        </div>
      </Card>
    </div>
  );
}
