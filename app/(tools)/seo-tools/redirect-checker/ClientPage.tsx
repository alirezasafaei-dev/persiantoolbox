'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { analyzeRedirectChain, type RedirectHop, type RedirectReport } from '@/lib/seo-utils';

export default function RedirectChecker() {
  const [hops, setHops] = useState<RedirectHop[]>([
    { url: '', status: 301 },
    { url: '', status: 200 },
  ]);
  const [rep, setRep] = useState<RedirectReport | null>(null);

  const add = () => setHops([...hops, { url: '', status: 200 }]);
  const update = (i: number, field: keyof RedirectHop, value: string | number) => {
    setHops(
      hops.map((hop, index) => {
        if (index !== i) {
          return hop;
        }
        return field === 'status'
          ? { ...hop, status: Number(value) || 200 }
          : { ...hop, url: String(value) };
      }),
    );
  };
  const remove = (i: number) => {
    if (hops.length > 1) {
      setHops(hops.filter((_, x) => x !== i));
    }
  };

  const check = () => {
    const clean = hops.filter((h) => h.url.trim());
    if (!clean.length) {
      return;
    }
    setRep(analyzeRedirectChain(clean));
  };
  const reset = () => {
    setHops([
      { url: '', status: 301 },
      { url: '', status: 200 },
    ]);
    setRep(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">بررسی ریدایرکت 301/302</h1>
      <p className="text-sm">توالی ریدایرکت را دستی وارد کنید (URL + کد).</p>
      <Card className="p-5 space-y-2">
        {hops.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={h.url}
              onChange={(e) => update(i, 'url', e.target.value)}
              placeholder="https://..."
              className="flex-1 p-2 border rounded text-sm"
            />
            <input
              type="number"
              value={h.status}
              onChange={(e) => update(i, 'status', parseInt(e.target.value) || 200)}
              className="w-20 p-2 border rounded"
            />
            {hops.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-red-500">
                ×
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button type="button" onClick={add} className="px-3 py-1 border text-sm rounded">
            + ردیف
          </button>
          <button
            type="button"
            onClick={check}
            className="px-5 py-1 bg-[var(--color-primary)] text-white rounded"
          >
            تحلیل زنجیره
          </button>
          <button type="button" onClick={reset} className="px-3 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {rep ? (
        <Card className="p-5 text-sm">
          <div>
            تعداد پرش: {rep.hops.length} {rep.tooManyHops ? '⚠️ زیاد' : null}
          </div>
          <div>
            وضعیت نهایی: {rep.finalStatus} {rep.hasErrorFinal ? '❌ خطا' : null}
          </div>
          <div>مخلوط پروتکل: {rep.mixedProtocol ? 'بله ⚠️' : 'خیر'}</div>
          <div>پیشنهاد: {rep.recommendations.join(' ')}</div>
        </Card>
      ) : null}
    </div>
  );
}
