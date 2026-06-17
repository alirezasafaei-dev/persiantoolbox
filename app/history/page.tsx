'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';

type HistoryEntry = {
  id: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  timestamp: number;
};

const STORAGE_KEY = 'persian-tools.history.v1';

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function exportAsJSON(entries: HistoryEntry[]) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `persian-tools-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsCSV(entries: HistoryEntry[]) {
  const headers = ['Tool', 'Input', 'Output', 'Date'];
  const rows = entries.map((e) => [
    e.tool,
    `"${e.inputSummary.replace(/"/g, '""')}"`,
    `"${e.outputSummary.replace(/"/g, '""')}"`,
    new Date(e.timestamp).toLocaleDateString('fa-IR'),
  ]);
  const csv = `\uFEFF${[headers.join(','), ...rows.map((r) => r.join(','))].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `persian-tools-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJSON(file: File): Promise<HistoryEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data)) {
          resolve(data);
        } else {
          reject(new Error('Invalid format'));
        }
      } catch {
        reject(new Error('Parse error'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const filtered = filter
    ? history.filter(
        (e) =>
          e.tool.includes(filter) ||
          e.inputSummary.includes(filter) ||
          e.outputSummary.includes(filter),
      )
    : history;

  const clearAll = () => {
    saveHistory([]);
    setHistory([]);
  };

  const removeEntry = (id: string) => {
    const next = history.filter((e) => e.id !== id);
    saveHistory(next);
    setHistory(next);
  };

  const handleImport = async (files: FileList | null) => {
    if (!files?.[0]) {
      return;
    }
    try {
      const imported = await importFromJSON(files[0]);
      const merged = [...history, ...imported].sort((a, b) => b.timestamp - a.timestamp);
      saveHistory(merged);
      setHistory(merged);
    } catch {
      console.error('خطا در خواندن فایل');
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            تاریخچه عملیات
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            {history.length > 0 ? `${history.length} عملیات ثبت شده` : 'هنوز عملیاتی ثبت نشده است'}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="جستجو در تاریخچه..."
          className="flex-1 min-w-[200px] rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          aria-label="جستجو"
        />
        <Button onClick={() => exportAsJSON(history)} disabled={history.length === 0}>
          دانلود JSON
        </Button>
        <Button
          onClick={() => exportAsCSV(history)}
          disabled={history.length === 0}
          variant="secondary"
        >
          دانلود CSV
        </Button>
        <label className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-[var(--bg-subtle)]">
          <span>بارگذاری فایل</span>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleImport(e.target.files)}
            aria-label="بارگذاری فایل JSON"
          />
        </label>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-[var(--color-danger)] hover:underline px-4 py-2"
          >
            پاک کردن همه
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <Card key={entry.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[var(--color-primary)] text-[var(--text-inverted)] px-2 py-0.5 rounded-full font-bold">
                    {entry.tool}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(entry.timestamp).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-xs text-[var(--color-danger)] hover:underline"
                >
                  حذف
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-2 text-xs">
                <div>
                  <span className="text-[var(--text-muted)]">ورودی: </span>
                  <span className="text-[var(--text-primary)]">{entry.inputSummary}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">خروجی: </span>
                  <span className="text-[var(--text-primary)]">{entry.outputSummary}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center space-y-4">
          <div className="text-4xl">📋</div>
          <p className="text-sm text-[var(--text-muted)]">
            {filter ? 'نتیجه‌ای یافت نشد' : 'تاریخچه‌ای ثبت نشده است'}
          </p>
        </Card>
      )}
    </div>
  );
}
