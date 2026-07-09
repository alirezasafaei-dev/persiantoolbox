'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { useToast } from '@/shared/ui/toast-context';
import { analyzeSeoTitle, type TitleAnalysis } from '@/lib/seo-utils';

export default function SeoTitleAnalyzer() {
  const [title, setTitle] = useState('');
  const [kw, setKw] = useState('');
  const [result, setResult] = useState<TitleAnalysis | null>(null);
  const { showToast } = useToast();

  const run = () => {
    if (!title.trim()) {
      return;
    }
    const r = analyzeSeoTitle(title, kw);
    setResult(r);
  };

  const reset = () => {
    setTitle('');
    setKw('');
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">تحلیل عنوان سئو</h1>
        <p className="text-[var(--text-muted)]">عنوان را تحلیل کنید و امتیاز ۰-۱۰۰ بگیرید.</p>
      </div>

      <Card className="p-6 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان صفحه"
          className="w-full border p-3 rounded bg-[var(--surface-1)]"
          aria-label="عنوان صفحه"
        />
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="کلمه کلیدی اصلی (اختیاری)"
          className="w-full border p-3 rounded bg-[var(--surface-1)]"
          aria-label="کلمه کلیدی اصلی"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={run}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            تحلیل
          </button>
          <button type="button" onClick={reset} className="px-4 py-2 border rounded">
            ریست
          </button>
        </div>
      </Card>

      {result ? (
        <Card className="p-6 space-y-3">
          <div>
            امتیاز: <span className="font-bold text-xl">{result.score}</span>/۱۰۰
          </div>
          <div>
            طول: {result.length} — {result.lengthStatus}
          </div>
          <div>کلمه کلیدی: {result.hasPrimaryKeyword ? 'دارد ✓' : 'ندارد'}</div>
          <div>
            جداکننده برند: {result.hasBrandSeparator ? 'دارد' : 'ندارد'}{' '}
            {result.duplicateSeparators ? '(تکراری!)' : ''}
          </div>
          <div className="mt-2">
            <div className="font-semibold mb-1">پیشنهادها:</div>
            <ul className="list-disc pr-5 text-sm">
              {result.recommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(title);
              showToast('کپی شد');
            }}
            className="text-sm border px-3 py-1 rounded"
          >
            کپی عنوان
          </button>
        </Card>
      ) : null}
      <div className="text-xs text-[var(--text-muted)]">محلی • بدون ارسال</div>
    </div>
  );
}
