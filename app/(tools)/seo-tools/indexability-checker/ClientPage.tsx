'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { analyzeIndexability, type IndexabilityReport } from '@/lib/seo-utils';

export default function IndexabilityChecker() {
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState('');
  const [xrobots, setXrobots] = useState('');
  const [rep, setRep] = useState<IndexabilityReport | null>(null);

  const check = () => setRep(analyzeIndexability(html, status, xrobots));
  const reset = () => {
    setHtml('');
    setStatus('');
    setXrobots('');
    setRep(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">چک ایندکس‌پذیری صفحه</h1>
      <Card className="p-6 space-y-3">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={6}
          placeholder="HTML شامل meta robots..."
          className="w-full font-mono p-2 text-xs border rounded"
        />
        <input
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="HTTP Status (مثال 200)"
          className="w-full p-2 border rounded text-sm"
        />
        <input
          value={xrobots}
          onChange={(e) => setXrobots(e.target.value)}
          placeholder="X-Robots-Tag (اختیاری)"
          className="w-full p-2 border rounded text-sm"
        />
        <div className="flex gap-2">
          <button type="button" onClick={check} className="px-5 py-2 bg-primary text-white rounded">
            بررسی
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {rep ? (
        <Card className="p-5">
          <div className="font-bold text-lg">وضعیت: {rep.status}</div>
          <ul className="list-disc pr-5 mt-2 text-sm">
            {rep.reasons.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="text-xs mt-2">
            این تحلیل فقط سیگنال‌های قابل مشاهده را بررسی می‌کند. تضمین نمی‌کند گوگل صفحه را ایندکس
            کند.
          </div>
        </Card>
      ) : null}
    </div>
  );
}
