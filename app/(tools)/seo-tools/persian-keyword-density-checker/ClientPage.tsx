'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { computePersianKeywordDensity, type KeywordDensityResult } from '@/lib/seo-utils';

export default function PersianKeywordDensityChecker() {
  const [text, setText] = useState('');
  const [kw, setKw] = useState('');
  const [res, setRes] = useState<KeywordDensityResult | null>(null);

  const run = () => {
    if (!text.trim()) {
      return;
    }
    setRes(computePersianKeywordDensity(text, kw));
  };
  const reset = () => {
    setText('');
    setKw('');
    setRes(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">بررسی چگالی کلمات کلیدی فارسی</h1>
      <Card className="p-6 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="متن فارسی خود را وارد کنید..."
          className="w-full p-3 border rounded bg-[var(--surface-1)]"
          aria-label="متن فارسی"
        />
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="کلمه کلیدی هدف (اختیاری)"
          className="w-full p-2 border rounded"
          aria-label="کلمه کلیدی هدف"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={run}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            محاسبه چگالی
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {res ? (
        <Card className="p-5 text-sm">
          <div>
            کل کلمات: {res.totalWords} | کاراکتر بدون فاصله: {res.totalChars}
          </div>
          <div>کلمات یکتا (بدون stopwords): {res.uniqueWords}</div>
          {res.keyword ? (
            <div>
              چگالی «{res.keyword}»: {res.keywordDensity}% ({res.keywordCount} بار)
            </div>
          ) : null}
          <div className="mt-3">
            <div className="font-semibold mb-1">پرتکرارترین‌ها:</div>
            <div className="grid grid-cols-2 gap-x-4 text-xs">
              {res.topTerms.slice(0, 8).map((term, i) => (
                <div key={i}>
                  {term.term}: {term.count} ({term.density}%)
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs mt-2">
            چگالی طبیعی معمولاً زیر ۲٪ است. تکرار بیش از حد ممکن است مضر باشد.
          </div>
        </Card>
      ) : null}
    </div>
  );
}
