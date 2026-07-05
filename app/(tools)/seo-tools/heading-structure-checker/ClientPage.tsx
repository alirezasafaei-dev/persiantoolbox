'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { analyzeHeadingStructure, type HeadingReport } from '@/lib/seo-utils';

export default function HeadingStructureChecker() {
  const [html, setHtml] = useState('');
  const [report, setReport] = useState<HeadingReport | null>(null);

  const analyze = () => {
    if (!html.trim()) {
      return;
    }
    const r = analyzeHeadingStructure(html);
    setReport(r);
  };

  const reset = () => {
    setHtml('');
    setReport(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">بررسی ساختار H1 تا H6</h1>
        <p className="text-sm text-[var(--text-muted)]">
          HTML را paste کنید. ساختار هدینگ تحلیل می‌شود. (URL mode بعداً)
        </p>
      </div>

      <Card className="p-6">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          placeholder="<h1>عنوان اصلی</h1>..."
          className="w-full font-mono text-xs border p-3 rounded bg-[var(--surface-1)]"
        />
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={analyze}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            تحلیل ساختار
          </button>
          <button type="button" onClick={reset} className="px-4 py-2 border rounded">
            پاک
          </button>
        </div>
      </Card>

      {report ? (
        <Card className="p-6 space-y-2 text-sm">
          <div>
            تعداد H1: {report.counts['H1'] ?? 0} {report.missingH1 ? '❌ گمشده' : null}{' '}
            {report.multipleH1 ? '⚠️ چندگانه' : null}
          </div>
          <div>
            H2: {report.counts['H2'] ?? 0} | H3: {report.counts['H3'] ?? 0} | H4+:{' '}
            {(report.counts['H4'] ?? 0) + (report.counts['H5'] ?? 0) + (report.counts['H6'] ?? 0)}
          </div>
          {report.skippedLevels.length > 0 && (
            <div className="text-amber-600">سطوح پرش شده: {report.skippedLevels.join(', ')}</div>
          )}
          <div className="mt-2">
            <div className="font-semibold">لیست هدینگ‌ها (به ترتیب):</div>
            <ol className="list-decimal pr-5 mt-1 max-h-60 overflow-auto">
              {report.headings.map((h, i) => (
                <li key={i}>
                  <code>{h.tag}</code>: {h.text}
                </li>
              ))}
            </ol>
          </div>
          <div className="text-xs mt-2">
            HTML کاربر رندر نمی‌شود و فقط تحلیل ساختار انجام می‌گیرد.
          </div>
        </Card>
      ) : null}
      <div className="text-xs text-[var(--text-muted)]">پردازش در مرورگر • امن</div>
    </div>
  );
}
