'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { analyzeOpenGraph, type OgReport } from '@/lib/seo-utils';

export default function OpenGraphChecker() {
  const [html, setHtml] = useState('');
  const [report, setReport] = useState<OgReport | null>(null);

  const check = () => setReport(analyzeOpenGraph(html));
  const reset = () => {
    setHtml('');
    setReport(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">بررسی Open Graph</h1>
      <Card className="p-6">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={7}
          placeholder="meta property=og:title ..."
          className="w-full font-mono text-xs p-3 border rounded bg-[var(--surface-1)]"
          aria-label="کد HTML صفحه"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={check}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            بررسی تگ‌ها
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            پاک
          </button>
        </div>
      </Card>
      {report ? (
        <Card className="p-5 text-sm">
          <div>og:title: {report.hasOgTitle ? '✓' : '❌'}</div>
          <div>og:description: {report.hasOgDesc ? '✓' : '❌'}</div>
          <div>og:image: {report.hasOgImage ? '✓' : '❌'}</div>
          <div>og:url: {report.hasOgUrl ? '✓' : '—'}</div>
          <div className="mt-1">twitter:title: {report.hasTwitterTitle ? '✓' : '—'}</div>
          <div>
            missing required:{' '}
            {report.missingRequired.length ? report.missingRequired.join(', ') : 'هیچ'}
          </div>
        </Card>
      ) : null}
      <div className="text-xs text-[var(--text-muted)]">پردازش محلی • تصویر fetch نمی‌شود.</div>
    </div>
  );
}
