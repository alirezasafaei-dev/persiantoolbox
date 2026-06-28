'use client';

import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import Card from '@/shared/ui/Card';

type AuditEntry = {
  id: string;
  timestamp: string;
  action: string;
  user_id: string;
  user_name: string;
  details: string;
};

type AuditResponse = {
  ok: boolean;
  entries: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const ACTION_LABELS: Record<string, string> = {
  login: 'ورود',
  logout: 'خروج',
  settings_change: 'تغییر تنظیمات',
  tool_toggle: 'تغییر وضعیت ابزار',
  user_update: 'بروزرسانی کاربر',
  content_update: 'بروزرسانی محتوا',
  system_action: 'عملیات سیستم',
  other: 'سایر',
};

const ACTION_COLORS: Record<string, string> = {
  login: 'var(--color-success)',
  logout: 'var(--color-warning)',
  settings_change: 'var(--color-primary)',
  tool_toggle: 'var(--color-primary)',
  user_update: 'var(--color-info)',
  content_update: 'var(--color-info)',
  system_action: 'var(--color-danger)',
  other: 'var(--text-muted)',
};

const PAGE_SIZE = 50;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function toCSV(entries: AuditEntry[]): string {
  const header = 'زمان,عملیات,کاربر,جزئیات';
  const rows = entries.map(
    (e) =>
      `"${e.timestamp}","${ACTION_LABELS[e.action] ?? e.action}","${e.user_name || e.user_id}","${e.details}"`,
  );
  return [header, ...rows].join('\n');
}

function downloadCSV(entries: AuditEntry[]) {
  const csv = `\uFEFF${toCSV(entries)}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAuditPage() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (actionFilter) {
        params.set('action', actionFilter);
      }
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const json: AuditResponse = await res.json();
      if (json.ok) {
        setData(json);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  const handleExport = () => {
    if (data?.entries) {
      downloadCSV(data.entries);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">گزارش عملیات ادمین</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">تاریخچه اقدامات مدیران سیستم</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!data?.entries?.length}
          className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          خروجی CSV
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-semibold text-[var(--text-primary)]">نوع عملیات:</label>
          <select
            value={actionFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="">همه</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {data ? (
            <span className="text-sm text-[var(--text-muted)]">
              {data.total.toLocaleString('fa-IR')} رکورد
            </span>
          ) : null}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : !data?.entries?.length ? (
          <div className="py-20 text-center">
            <p className="text-lg text-[var(--text-muted)]">هیچ رکوردی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--surface-2)]">
                  <th className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                    زمان
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                    عملیات
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                    کاربر
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">
                    جزئیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[var(--border-light)] transition-colors hover:bg-[var(--surface-2)]/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]" dir="ltr">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${ACTION_COLORS[entry.action] ?? 'var(--text-muted)'} 15%, transparent)`,
                          color: ACTION_COLORS[entry.action] ?? 'var(--text-muted)',
                        }}
                      >
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {entry.user_name || entry.user_id || '—'}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-[var(--text-secondary)]">
                      {entry.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            قبلی
          </button>
          <span className="px-4 text-sm text-[var(--text-primary)]">
            صفحه {page.toLocaleString('fa-IR')} از {data.totalPages.toLocaleString('fa-IR')}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}
