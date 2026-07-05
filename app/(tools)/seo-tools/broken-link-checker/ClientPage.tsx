'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { extractAndClassifyLinks, type LinkInfo } from '@/lib/seo-utils';

export default function BrokenLinkChecker() {
  const [html, setHtml] = useState('');
  const [links, setLinks] = useState<LinkInfo[]>([]);

  const analyze = () => {
    const res = extractAndClassifyLinks(html);
    setLinks(res);
  };
  const reset = () => {
    setHtml('');
    setLinks([]);
  };

  const counts = links.reduce<Partial<Record<LinkInfo['type'], number>>>((acc, link) => {
    acc[link.type] = (acc[link.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">بررسی لینک شکسته یک صفحه</h1>
      <p className="text-sm text-[var(--text-muted)]">فقط یک صفحه • HTML paste کنید • بدون کرالر</p>
      <Card className="p-6">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          placeholder="<a href=...>"
          className="w-full font-mono text-xs p-3 border rounded bg-[var(--surface-1)]"
        />
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={analyze}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            استخراج و دسته‌بندی
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {links.length > 0 && (
        <Card className="p-5">
          <div>
            تعداد کل لینک: {links.length} | خلاصه:{' '}
            {Object.entries(counts)
              .map(([k, v]) => `${k}:${v}`)
              .join(' ')}
          </div>
          <ul className="mt-3 text-sm max-h-72 overflow-auto divide-y">
            {links.slice(0, 60).map((l, i) => (
              <li key={i} className="py-1 flex justify-between">
                <span className="font-mono truncate max-w-[70%]">{l.href || '(خالی)'}</span>{' '}
                <span className="text-xs px-2 py-0.5 bg-[var(--surface-2)] rounded">{l.type}</span>
              </li>
            ))}
          </ul>
          <div className="text-xs mt-2">لینک‌های empty و javascript: را اصلاح کنید.</div>
        </Card>
      )}
    </div>
  );
}
