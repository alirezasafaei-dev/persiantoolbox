'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { useToast } from '@/shared/ui/toast-context';
import { generateMetaDescriptions } from '@/lib/seo-utils';

export default function MetaDescriptionGenerator() {
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const { showToast } = useToast();

  const generate = () => {
    const res = generateMetaDescriptions(topic, keyword);
    setResults(res);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('کپی شد');
  };

  const reset = () => {
    setTopic('');
    setKeyword('');
    setResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold mb-2">مولد متا دیسکریپشن فارسی</h1>
        <p className="text-[var(--text-muted)]">
          موضوع یا عنوان صفحه را وارد کنید تا پیشنهادهای تمیز ۱۲۰-۱۶۰ کاراکتری دریافت کنید.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-1">موضوع / عنوان صفحه</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full border rounded p-3 bg-[var(--surface-1)]"
            placeholder="مثال: راهنمای کامل انتخاب وام مسکن"
            aria-label="موضوع یا عنوان صفحه"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">کلمه کلیدی اصلی (اختیاری)</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border rounded p-3 bg-[var(--surface-1)]"
            placeholder="وام مسکن"
            aria-label="کلمه کلیدی اصلی"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generate}
            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded"
          >
            تولید پیشنهادها
          </button>
          <button type="button" onClick={reset} className="px-4 py-2 border rounded">
            پاک کردن
          </button>
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="p-6 space-y-3">
          <div className="font-semibold">پیشنهادها</div>
          {results.map((r, i) => (
            <div
              key={i}
              className="border rounded p-3 bg-[var(--surface-2)] flex justify-between gap-3"
            >
              <div className="text-sm flex-1">
                {r} <span className="text-xs text-[var(--text-muted)]">({r.length})</span>
              </div>
              <button
                type="button"
                onClick={() => copy(r)}
                className="text-xs px-3 py-1 border rounded self-start"
              >
                کپی
              </button>
            </div>
          ))}
          <div className="text-xs text-[var(--text-muted)]">
            پیشنهادها تقریبی هستند. آن‌ها را ویرایش کنید تا طبیعی و دقیق شوند.
          </div>
        </Card>
      )}

      <div className="text-xs text-[var(--text-muted)]">
        پردازش محلی • بدون API خارجی • از الگوهای قاعده‌مند استفاده می‌شود.
      </div>
    </div>
  );
}
