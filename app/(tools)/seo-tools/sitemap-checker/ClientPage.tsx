'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { analyzeSitemapXml, type SitemapReport } from '@/lib/seo-utils';

export default function SitemapChecker() {
  const [xml, setXml] = useState('');
  const [rep, setRep] = useState<SitemapReport | null>(null);

  const check = () => setRep(analyzeSitemapXml(xml));
  const reset = () => {
    setXml('');
    setRep(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">بررسی sitemap.xml</h1>
      <Card className="p-6">
        <textarea
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          rows={9}
          placeholder="<?xml ... <url><loc>https://...</loc></url>"
          className="w-full font-mono text-xs p-3 border rounded bg-[var(--surface-1)]"
          aria-label="محتوای sitemap.xml"
        />
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={check}
            className="px-5 py-2 bg-[var(--color-primary)] text-[var(--text-inverted)] rounded"
          >
            تحلیل
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {rep ? (
        <Card className="p-5 text-sm">
          <div>تعداد URL: {rep.urlCount}</div>
          <div>تکراری: {rep.duplicates.length || 'ندارد'}</div>
          <div>loc نامعتبر: {rep.invalidLocs.length || 0}</div>
          <div>هشدارها: {rep.warnings.length ? rep.warnings.join(' ') : '—'}</div>
          <div className="text-xs mt-1">XML معتبر: {rep.isValidXml ? 'بله' : 'خیر'}</div>
        </Card>
      ) : null}
      <div className="text-xs">پردازش محلی • ادعای پذیرش گوگل نمی‌کند.</div>
    </div>
  );
}
