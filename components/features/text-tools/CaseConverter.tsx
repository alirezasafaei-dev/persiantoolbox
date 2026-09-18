'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'toggle';

function convertCase(text: string, caseType: CaseType): string {
  switch (caseType) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    case 'sentence':
      return text.replace(/(^\s*|[.!?؟]\s+)(\w)/g, (_match, sep, char) => sep + char.toUpperCase());
    case 'toggle':
      return text
        .split('')
        .map((c: string) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
        .join('');
  }
}

export default function CaseConverterPage() {
  const [text, setText] = useState('');
  const [caseType, setCaseType] = useState<CaseType>('upper');

  const result = useMemo(() => {
    if (!text) {
      return '';
    }
    return convertCase(text, caseType);
  }, [text, caseType]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-info-rgb)/0.15),transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary)">
            تبدیل حروف (Case Converter)
          </h1>
          <p className="text-base md:text-lg text-(--text-muted) leading-relaxed">
            متن خود را به حروف بزرگ، کوچک، عنوانی یا جمله‌ای تبدیل کنید.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          { value: 'upper' as CaseType, label: 'بزرگ (UPPER)' },
          { value: 'lower' as CaseType, label: 'کوچک (lower)' },
          { value: 'title' as CaseType, label: 'عنوانی (Title)' },
          { value: 'sentence' as CaseType, label: 'جمله‌ای (Sentence)' },
          { value: 'toggle' as CaseType, label: 'معکوس (tOGGLE)' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setCaseType(opt.value)}
            aria-pressed={caseType === opt.value}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${caseType === opt.value ? 'bg-primary text-(--text-inverted)' : 'bg-(--surface-1) text-(--text-primary) border border-(--border-light)'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-2">
          <label htmlFor="case-input" className="text-sm font-semibold text-(--text-primary)">
            ورودی
          </label>
          <textarea
            id="case-input"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن خود را اینجا بنویسید..."
            className="w-full rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) placeholder:text-(--text-muted) focus:border-primary focus:outline-hidden resize-y"
            aria-label="متن ورودی"
          />
        </Card>
        <Card className="p-4 space-y-2">
          <label htmlFor="case-output" className="text-sm font-semibold text-(--text-primary)">
            خروجی
          </label>
          <textarea
            id="case-output"
            rows={6}
            readOnly
            value={result}
            className="w-full rounded-md border border-(--border-light) bg-(--bg-subtle) p-3 text-(--text-primary)"
            aria-label="متن خروجی"
          />
          {result ? (
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(result)}
              className="inline-flex items-center gap-1 rounded-[14px] bg-primary px-3 py-1 text-xs font-bold text-(--text-inverted) transition-all hover:brightness-110"
            >
              کپی نتیجه
            </button>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
