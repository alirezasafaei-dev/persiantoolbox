'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { analyzeRobotsTxt, type RobotsReport } from '@/lib/seo-utils';

export default function RobotsTxtChecker() {
  const [txt, setTxt] = useState('');
  const [report, setReport] = useState<RobotsReport | null>(null);

  const check = () => setReport(analyzeRobotsTxt(txt));
  const reset = () => {
    setTxt('');
    setReport(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">بررسی robots.txt</h1>
      <p className="text-sm text-[var(--text-muted)]">
        محتوای robots.txt را paste کنید. (URL fetch بعداً)
      </p>
      <Card className="p-6">
        <textarea
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          rows={10}
          placeholder="User-agent: *\nDisallow: /admin\nSitemap: https://..."
          className="w-full font-mono text-xs p-3 border rounded bg-[var(--surface-1)]"
        />
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={check}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            تحلیل
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {report ? (
        <Card className="p-5 text-sm space-y-1">
          <div>User-agent: {report.hasUserAgent ? 'دارد ✓' : 'ندارد ⚠️'}</div>
          <div>Sitemap: {report.sitemaps.length ? report.sitemaps.join(', ') : 'ندارد'}</div>
          <div>مشکلات: {report.issues.length ? report.issues.join(' | ') : '—'}</div>
          <div>پیشنهاد: {report.recommendations.join(' ')}</div>
        </Card>
      ) : null}
    </div>
  );
}
