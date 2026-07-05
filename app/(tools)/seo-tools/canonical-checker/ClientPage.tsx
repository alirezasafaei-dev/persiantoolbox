'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { analyzeCanonical, type CanonicalReport } from '@/lib/seo-utils';

export default function CanonicalChecker() {
  const [html, setHtml] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [report, setReport] = useState<CanonicalReport | null>(null);

  const check = () => setReport(analyzeCanonical(html, pageUrl || undefined));
  const reset = () => {
    setHtml('');
    setPageUrl('');
    setReport(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">بررسی Canonical</h1>
        <p className="text-[var(--text-muted)]">HTML را paste کنید تا تگ canonical بررسی شود.</p>
      </div>
      <Card className="p-6 space-y-3">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={6}
          placeholder='<link rel="canonical" href="..." />'
          className="w-full font-mono text-xs p-3 border rounded bg-[var(--surface-1)]"
        />
        <input
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          placeholder="URL صفحه (اختیاری برای مقایسه)"
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={check}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            بررسی
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {report ? (
        <Card className="p-5 text-sm space-y-1">
          <div>تعداد canonical: {report.canonicals.length}</div>
          {report.missing ? <div className="text-red-600">گمشده ❌</div> : null}
          {report.multiple ? <div className="text-amber-600">چندگانه ⚠️</div> : null}
          {report.isRelative ? (
            <div className="text-amber-600">نسبی است (باید مطلق باشد)</div>
          ) : null}
          {report.canonicals[0] ? (
            <div className="font-mono break-all">یافت شده: {report.canonicals[0]}</div>
          ) : null}
          {report.selfRefMatch !== undefined && (
            <div>خودارجاع: {report.selfRefMatch ? 'بله ✓' : 'خیر'}</div>
          )}
        </Card>
      ) : null}
      <div className="text-xs text-[var(--text-muted)]">محلی و ایمن • HTML اجرا نمی‌شود.</div>
    </div>
  );
}
