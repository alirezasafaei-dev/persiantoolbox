'use client';

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  emptyMessage = 'داده‌ای یافت نشد',
  searchable = false,
  searchPlaceholder = 'جستجو...',
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) {
      return data;
    }
    return data.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(search.toLowerCase())),
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sortKey) {
      return filtered;
    }
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) {
        return 1;
      }
      if (bVal === null || bVal === undefined) {
        return -1;
      }
      const cmp = String(aVal).localeCompare(String(bVal), 'fa');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-3">
      {searchable && (
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          dir="rtl"
        />
      )}

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-light)]">
        <table className="w-full text-sm text-[var(--text-primary)]">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--surface-2)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-right text-xs font-semibold text-[var(--text-muted)] ${
                    col.sortable
                      ? 'cursor-pointer select-none hover:text-[var(--text-primary)]'
                      : ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (
                      <span className="text-[var(--color-primary)]">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-[var(--text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--surface-2)]/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            نمایش {page * pageSize + 1} تا {Math.min((page + 1) * pageSize, sorted.length)} از{' '}
            {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded px-2 py-1 hover:bg-[var(--surface-2)] disabled:opacity-30"
            >
              ← قبلی
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = page < 3 ? i : page - 2 + i;
              if (pageNum < 0 || pageNum >= totalPages) {
                return null;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`rounded px-2 py-1 ${
                    pageNum === page
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="rounded px-2 py-1 hover:bg-[var(--surface-2)] disabled:opacity-30"
            >
              بعدی →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
