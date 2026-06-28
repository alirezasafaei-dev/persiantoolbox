'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';

type Mode = 'all' | 'extra' | 'trailing' | 'leading';

function removeSpaces(text: string, mode: Mode): string {
  switch (mode) {
    case 'all':
      return text.replace(/\s/g, '');
    case 'extra':
      return text.replace(/\s+/g, ' ').trim();
    case 'trailing':
      return text.replace(/[ \t]+$/gm, '');
    case 'leading':
      return text.replace(/^[ \t]+/gm, '');
  }
}

export default function RemoveSpacesPage() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('extra');

  const result = useMemo(() => {
    if (!text) {
      return '';
    }
    return removeSpaces(text, mode);
  }, [text, mode]);

  const stats = useMemo(() => {
    const removed = text.length - result.length;
    return { removed, percent: text.length > 0 ? ((removed / text.length) * 100).toFixed(1) : '0' };
  }, [text, result]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-warning-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            حذف فاصله‌های اضافی
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            فاصله‌های اضافی، Tab و فاصله‌های انتهایی خطوط را از متن حذف کنید.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          { value: 'extra' as Mode, label: 'فاصله‌های اضافی' },
          { value: 'all' as Mode, label: 'همه فاصله‌ها' },
          { value: 'trailing' as Mode, label: 'فاصله انتهای خط' },
          { value: 'leading' as Mode, label: 'فاصله ابتدای خط' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            aria-pressed={mode === opt.value}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${mode === opt.value ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)]'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-2">
          <label
            htmlFor="spaces-input"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            ورودی
          </label>
          <textarea
            id="spaces-input"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن خود را اینجا بنویسید..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none resize-y font-mono text-sm"
            aria-label="متن ورودی"
          />
        </Card>
        <Card className="p-4 space-y-2">
          <label
            htmlFor="spaces-output"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            خروجی
          </label>
          <textarea
            id="spaces-output"
            rows={8}
            readOnly
            value={result}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-subtle)] p-3 text-[var(--text-primary)] font-mono text-sm"
            aria-label="متن خروجی"
          />
          {text ? (
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>
                حذف شده: {stats.removed.toLocaleString('fa')} کاراکتر ({stats.percent}%)
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result)}
                className="inline-flex items-center gap-1 rounded-[14px] bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-[var(--text-inverted)] transition-all hover:brightness-110"
              >
                کپی
              </button>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
