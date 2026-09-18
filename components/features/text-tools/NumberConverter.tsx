'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toPersianNumber(text: string): string {
  return text
    .replace(/[0-9]/g, (d) => persianDigits[+d] ?? d)
    .replace(/[٠-٩]/g, (d) => persianDigits[arabicDigits.indexOf(d)] ?? d);
}

function toEnglishNumber(text: string): string {
  let result = text;
  persianDigits.forEach((p, i) => {
    result = result.replaceAll(p, String(i));
  });
  arabicDigits.forEach((a, i) => {
    result = result.replaceAll(a, String(i));
  });
  return result;
}

function toArabicNumber(text: string): string {
  return text
    .replace(/[0-9]/g, (d) => arabicDigits[+d] ?? d)
    .replace(/[۰-۹]/g, (d) => arabicDigits[persianDigits.indexOf(d)] ?? d);
}

export default function NumberConverterPage() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'to-persian' | 'to-english' | 'to-arabic'>(
    'to-persian',
  );

  const output = (() => {
    if (!input) {
      return '';
    }
    switch (direction) {
      case 'to-persian':
        return toPersianNumber(input);
      case 'to-english':
        return toEnglishNumber(input);
      case 'to-arabic':
        return toArabicNumber(input);
    }
  })();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-info-rgb)/0.15),transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary)">
            تبدیل اعداد فارسی و انگلیسی
          </h1>
          <p className="text-base md:text-lg text-(--text-muted) leading-relaxed">
            اعداد فارسی (۰۱۲۳۴۵۶۷۸۹)، عربی (٠١٢٣٤٥٦٧٨٩) و انگلیسی (0123456789) را به‌صورت آنی به
            یکدیگر تبدیل کنید.
          </p>
        </div>
      </section>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'to-persian', label: 'به فارسی' },
            { value: 'to-english', label: 'به انگلیسی' },
            { value: 'to-arabic', label: 'به عربی' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDirection(opt.value as typeof direction)}
              aria-pressed={direction === opt.value}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                direction === opt.value
                  ? 'bg-primary text-(--text-inverted)'
                  : 'bg-(--surface-1) text-(--text-primary) border border-(--border-light)'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label htmlFor="number-input" className="text-sm font-semibold text-(--text-primary)">
            عدد یا متن حاوی عدد را وارد کنید
          </label>
          <textarea
            id="number-input"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: ۱۲۳۴۵ یا 12345"
            className="w-full rounded-md border border-(--border-light) bg-(--surface-1) p-4 text-(--text-primary) placeholder:text-(--text-muted) focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y font-mono text-lg"
            aria-label="ورودی عدد"
          />
        </div>

        {output ? (
          <div className="space-y-2">
            <label htmlFor="number-output" className="text-sm font-semibold text-(--text-primary)">
              نتیجه
            </label>
            <textarea
              id="number-output"
              rows={4}
              readOnly
              value={output}
              className="w-full rounded-md border border-(--border-light) bg-(--bg-subtle) p-4 text-(--text-primary) font-mono text-lg"
              aria-label="خروجی عدد"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(output)}
              className="inline-flex items-center gap-2 rounded-[14px] bg-primary px-4 py-2 text-sm font-bold text-(--text-inverted) transition-all hover:brightness-110"
            >
              کپی نتیجه
            </button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
