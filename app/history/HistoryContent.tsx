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

export default function HistoryContent() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return (
    <div className="space-y-8 py-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">تاریخچه عملیات</h1>
          {history.length > 0 && (
            <Button onClick={clearHistory} variant="danger" className="text-sm">
              پاک کردن تاریخچه
            </Button>
          )}
        </div>
        <p className="text-[var(--text-secondary)]">
          تاریخچه عملیات شما در مرورگر ذخیره می‌شود و به سرور ارسال نمی‌شود.
        </p>
      </section>

      {history.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          تاریخچه‌ای موجود نیست.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{entry.tool}</span>
                  <span className="text-xs text-[var(--text-muted)] me-3">
                    {new Intl.DateTimeFormat('fa-IR').format(new Date(entry.timestamp))}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">{entry.outputSummary}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
