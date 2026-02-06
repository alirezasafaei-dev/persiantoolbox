'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from '@/shared/ui/toast-context';

type Toast = {
  id: string;
  message: string;
  tone?: 'success' | 'error' | 'info';
};

type CopyItem = {
  id: string;
  label: string;
  value: string;
  at: number;
  pinned?: boolean;
};

const COPY_STORAGE_KEY = 'persian-tools.copy-history.v1';
const MAX_COPY_ITEMS = 10;
const COPY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copyHistory, setCopyHistory] = useState<CopyItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyLabelFilter, setHistoryLabelFilter] = useState('all');
  const [historyDateFilter, setHistoryDateFilter] = useState('all');
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const raw = window.localStorage.getItem(COPY_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as CopyItem[];
      if (Array.isArray(parsed)) {
        const fresh = parsed.filter((item) => Date.now() - item.at <= COPY_TTL_MS);
        setCopyHistory(fresh.slice(0, MAX_COPY_ITEMS));
      }
    } catch {
      setCopyHistory([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(COPY_STORAGE_KEY, JSON.stringify(copyHistory));
  }, [copyHistory]);

  useEffect(() => {
    if (!isHistoryOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!historyRef.current) {
        return;
      }
      if (!historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isHistoryOpen]);

  const showToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const recordCopy = useCallback((label: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    const nextItem: CopyItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label,
      value: trimmed,
      at: Date.now(),
    };
    setCopyHistory((prev) => {
      const filtered = prev.filter((item) => item.value !== trimmed || item.label !== label);
      const combined = [nextItem, ...filtered];
      const pruned = combined.filter((item) => Date.now() - item.at <= COPY_TTL_MS);
      return pruned.slice(0, MAX_COPY_ITEMS);
    });
  }, []);

  const value = useMemo(() => ({ showToast, recordCopy }), [showToast, recordCopy]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 left-0 right-0 z-[80] flex flex-col items-center gap-3 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'pointer-events-auto w-full max-w-md rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-semibold shadow-[var(--shadow-strong)] backdrop-blur',
              toast.tone === 'error'
                ? 'border-[rgb(var(--color-danger-rgb)/0.4)] bg-[rgb(var(--color-danger-rgb)/0.18)] text-[var(--color-danger)]'
                : toast.tone === 'info'
                  ? 'border-[rgb(var(--color-info-rgb)/0.4)] bg-[rgb(var(--color-info-rgb)/0.18)] text-[var(--color-info)]'
                  : 'border-[rgb(var(--color-success-rgb)/0.4)] bg-[rgb(var(--color-success-rgb)/0.18)] text-[var(--color-success)]',
            ].join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <div className="fixed top-4 right-4 z-[75]">
        <button
          type="button"
          onClick={() => setIsHistoryOpen((prev) => !prev)}
          className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/90 px-3 py-2 text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow-subtle)]"
        >
          تاریخچه کپی‌ها {copyHistory.length ? `(${copyHistory.length})` : ''}
        </button>
        {isHistoryOpen && copyHistory.length ? (
          <div
            ref={historyRef}
            className="mt-2 w-72 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/95 p-4 shadow-[var(--shadow-strong)] backdrop-blur"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>آخرین کپی‌ها</span>
              <button
                type="button"
                className="font-semibold text-[var(--color-primary)]"
                onClick={() => setCopyHistory([])}
              >
                پاک‌سازی
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-xs">
                <input
                  type="search"
                  value={historyQuery}
                  onChange={(event) => setHistoryQuery(event.target.value)}
                  placeholder="جستجو در تاریخچه..."
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  value={historyLabelFilter}
                  onChange={(event) => setHistoryLabelFilter(event.target.value)}
                  className="input-field py-2 text-xs"
                >
                  <option value="all">همه برچسب‌ها</option>
                  {Array.from(new Set(copyHistory.map((item) => item.label))).map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={historyDateFilter}
                  onChange={(event) => setHistoryDateFilter(event.target.value)}
                  className="input-field py-2 text-xs"
                >
                  <option value="all">همه زمان‌ها</option>
                  <option value="today">امروز</option>
                  <option value="week">۷ روز اخیر</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <button
                  type="button"
                  className="font-semibold text-[var(--color-primary)]"
                  onClick={() => {
                    const header = 'label,value,at';
                    const rows = copyHistory.map((item) =>
                      [item.label, `"${item.value.replace(/"/g, '""')}"`, item.at].join(','),
                    );
                    const csv = [header, ...rows].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'copy-history.csv';
                    link.click();
                    URL.revokeObjectURL(url);
                    showToast('CSV آماده شد', 'success');
                  }}
                >
                  خروجی CSV
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {copyHistory
                .filter((item) => {
                  const matchesQuery = historyQuery.trim()
                    ? `${item.label} ${item.value}`
                      .toLowerCase()
                      .includes(historyQuery.trim().toLowerCase())
                    : true;
                  const matchesLabel =
                    historyLabelFilter === 'all' ? true : item.label === historyLabelFilter;
                  const now = Date.now();
                  const matchesDate =
                    historyDateFilter === 'all'
                      ? true
                      : historyDateFilter === 'today'
                        ? now - item.at <= 24 * 60 * 60 * 1000
                        : now - item.at <= 7 * 24 * 60 * 60 * 1000;
                  return matchesQuery && matchesLabel && matchesDate;
                })
                .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius-md)] border border-[var(--border-light)] p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[10px] text-[var(--text-muted)]">{item.label}</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-[10px] font-semibold text-[var(--color-warning)]"
                          onClick={() =>
                            setCopyHistory((prev) =>
                              prev.map((entry) =>
                                entry.id === item.id ? { ...entry, pinned: !entry.pinned } : entry,
                              ),
                            )
                          }
                        >
                          {item.pinned ? '📌' : '📍'}
                        </button>
                        <button
                          type="button"
                          className="text-[10px] font-semibold text-[var(--color-primary)]"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(item.value);
                              showToast('کپی شد', 'success');
                              recordCopy(item.label, item.value);
                            } catch {
                              showToast('کپی انجام نشد', 'error');
                            }
                          }}
                        >
                          کپی مجدد
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-primary)] ltr-num break-all">
                      {item.value}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
