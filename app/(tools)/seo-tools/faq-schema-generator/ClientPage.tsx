'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { useToast } from '@/shared/ui/toast-context';
import { buildFaqJsonLd } from '@/lib/seo-utils';

type QA = { q: string; a: string };

export default function FaqSchemaGenerator() {
  const [items, setItems] = useState<QA[]>([{ q: '', a: '' }]);
  const [output, setOutput] = useState('');
  const { showToast } = useToast();

  const add = () => setItems([...items, { q: '', a: '' }]);
  const remove = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const update = (idx: number, field: 'q' | 'a', val: string) => {
    const copy = [...items];
    const curr = copy[idx] ?? { q: '', a: '' };
    copy[idx] = { ...curr, [field]: val };
    setItems(copy);
  };

  const generate = () => {
    const json = buildFaqJsonLd(items);
    const pretty = JSON.stringify(json, null, 2);
    setOutput(pretty);
  };

  const copy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      showToast('کپی شد');
    }
  };

  const reset = () => {
    setItems([{ q: '', a: '' }]);
    setOutput('');
  };

  const canGen = items.some((it) => it.q.trim() && it.a.trim());

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">مولد FAQ Schema</h1>
        <p className="text-[var(--text-muted)]">
          سوالات و پاسخ‌ها را وارد کنید و JSON-LD معتبر دریافت کنید.
        </p>
      </div>

      <Card className="p-6 space-y-3">
        {items.map((it, i) => (
          <div key={i} className="space-y-2 border rounded p-3">
            <input
              value={it.q}
              onChange={(e) => update(i, 'q', e.target.value)}
              placeholder={`سوال ${i + 1}`}
              className="w-full p-2 border rounded"
            />
            <textarea
              value={it.a}
              onChange={(e) => update(i, 'a', e.target.value)}
              placeholder="پاسخ..."
              rows={2}
              className="w-full p-2 border rounded"
            />
            {items.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-600">
                حذف
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button type="button" onClick={add} className="px-3 py-1 border rounded">
            + افزودن سوال
          </button>
          <button
            type="button"
            onClick={generate}
            disabled={!canGen}
            className="px-5 py-1 bg-[var(--color-primary)] text-white rounded disabled:opacity-50"
          >
            تولید JSON-LD
          </button>
          <button type="button" onClick={reset} className="px-3 py-1 border rounded">
            ریست
          </button>
        </div>
      </Card>

      {output ? (
        <Card className="p-4">
          <pre className="text-xs overflow-auto bg-[var(--surface-2)] p-3 rounded max-h-[420px] whitespace-pre-wrap">
            {output}
          </pre>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={copy} className="px-4 py-1 border rounded">
              کپی JSON-LD
            </button>
          </div>
          <div className="text-xs mt-2 text-[var(--text-muted)]">
            این کد را در تگ script type=application/ld+json قرار دهید.
          </div>
        </Card>
      ) : null}
    </div>
  );
}
