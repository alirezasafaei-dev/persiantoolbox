'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';

type ExtractResult = {
  emails: string[];
  phones: string[];
  urls: string[];
  numbers: string[];
};

function extractInfo(text: string): ExtractResult {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:0[0-9]{10}|0098[0-9]{10}|\+98[0-9]{10}|09[0-9]{9})/g;
  const urlRegex = /https?:\/\/[^\s<>{}|\\^`[\]]+/g;
  const numberRegex = /\b\d[\d,.\d]*\b/g;

  return {
    emails: [...new Set(text.match(emailRegex) ?? [])],
    phones: [...new Set(text.match(phoneRegex) ?? [])],
    urls: [...new Set(text.match(urlRegex) ?? [])],
    numbers: [...new Set(text.match(numberRegex) ?? [])].slice(0, 20),
  };
}

export default function ExtractInfoPage() {
  const [text, setText] = useState('');
  const result = useMemo(() => extractInfo(text), [text]);
  const totalFound = result.emails.length + result.phones.length + result.urls.length;

  const Section = ({ title, items, icon }: { title: string; items: string[]; icon: string }) => (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {icon} {title}
        </h3>
        <span className="text-xs text-[var(--text-muted)]">{items.length} مورد</span>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--bg-subtle)] px-3 py-2 text-sm font-mono"
            >
              <span className="text-[var(--text-primary)] truncate">{item}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(item)}
                className="text-xs text-[var(--color-primary)] hover:underline shrink-0 ms-2"
              >
                کپی
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">موردی یافت نشد</p>
      )}
    </Card>
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            استخراج اطلاعات از متن
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            ایمیل، شماره تلفن، URL و اعداد را به‌صورت خودکار از متن استخراج کنید.
          </p>
        </div>
      </section>

      <Card className="p-4 space-y-2">
        <label htmlFor="extract-input" className="text-sm font-semibold text-[var(--text-primary)]">
          متن حاوی اطلاعات
        </label>
        <textarea
          id="extract-input"
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="متن خود را اینجا بنویسید یا paste کنید..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none resize-y"
          aria-label="متن ورودی"
        />
        {text && <div className="text-xs text-[var(--text-muted)]">{totalFound} مورد یافت شد</div>}
      </Card>

      {text && (
        <div className="grid gap-4 md:grid-cols-2">
          <Section title="ایمیل‌ها" items={result.emails} icon="📧" />
          <Section title="شماره تلفن‌ها" items={result.phones} icon="📱" />
          <Section title="لینک‌ها" items={result.urls} icon="🔗" />
          <Section title="اعداد" items={result.numbers} icon="🔢" />
        </div>
      )}
    </div>
  );
}
