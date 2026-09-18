'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import Card from '@/shared/ui/Card';

type SharedEntry = {
  tool: string;
  inputSummary: string;
  outputSummary: string;
  outputUrl: string | null;
  createdAt: number;
};

type Props = {
  token: string;
};

export default function ShareContent({ token }: Props) {
  const [entry, setEntry] = useState<SharedEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/history/share/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Link not found');
        }
        return res.json();
      })
      .then((data) => setEntry(data.entry))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-(--text-primary)">لینک نامعتبر</h1>
        <p className="mt-2 text-sm text-(--text-muted)">{error}</p>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-(--border-light) bg-(--surface-1) px-4 py-2 text-xs font-semibold text-(--text-muted)">
          اشتراک‌گذاری تاریخچه
        </p>
        <h1 className="text-2xl font-black text-(--text-primary)">نتیجه اشتراک‌گذاری شده</h1>
      </section>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-(--text-primary)">{entry.tool}</span>
          <span className="text-xs text-(--text-muted)">{formattedDate}</span>
        </div>
        {entry.inputSummary ? (
          <div className="mt-3">
            <p className="text-xs font-semibold text-(--text-muted)">ورودی:</p>
            <p className="mt-1 text-sm text-(--text-secondary)">{entry.inputSummary}</p>
          </div>
        ) : null}
        <div className="mt-3">
          <p className="text-xs font-semibold text-(--text-muted)">خروجی:</p>
          <p className="mt-1 text-sm leading-7 text-(--text-secondary)">{entry.outputSummary}</p>
        </div>
        {entry.outputUrl ? (
          <a
            href={entry.outputUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-primary hover:text-(--color-primary-hover)"
          >
            دانلود فایل خروجی
          </a>
        ) : null}
      </Card>
    </div>
  );
}
