'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { useToast } from '@/shared/ui/toast-context';
import { buildHowToJsonLd } from '@/lib/seo-utils';

export default function HowToSchemaGenerator() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [steps, setSteps] = useState<string[]>(['', '']);
  const [jsonOut, setJsonOut] = useState('');
  const { showToast } = useToast();

  const addStep = () => setSteps([...steps, '']);
  const updateStep = (i: number, v: string) => {
    const c = [...steps];
    c[i] = v;
    setSteps(c);
  };
  const removeStep = (i: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, idx) => idx !== i));
    }
  };

  const gen = () => {
    if (!title.trim() || steps.filter(Boolean).length < 2) {
      return;
    }
    const j = buildHowToJsonLd(title, desc, steps);
    setJsonOut(JSON.stringify(j, null, 2));
  };

  const copy = () => {
    navigator.clipboard.writeText(jsonOut);
    showToast('کپی شد');
  };
  const reset = () => {
    setTitle('');
    setDesc('');
    setSteps(['', '']);
    setJsonOut('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">مولد HowTo Schema</h1>
      <Card className="p-6 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان راهنما"
          className="w-full p-3 border rounded"
          aria-label="عنوان راهنما"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="توضیح مختصر"
          rows={2}
          className="w-full p-3 border rounded"
          aria-label="توضیح مختصر"
        />
        <div>
          <div className="font-semibold mb-1 text-sm">مراحل (حداقل ۲)</div>
          {steps.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={s}
                onChange={(e) => updateStep(i, e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder={`گام ${i + 1}`}
                aria-label={`مرحله ${i + 1}`}
              />
              {steps.length > 2 && (
                <button type="button" onClick={() => removeStep(i)} className="text-red-500">
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addStep} className="text-sm border px-2 py-1 rounded">
            + گام جدید
          </button>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={gen}
            className="px-5 py-2 bg-[var(--color-primary)] text-[var(--text-inverted)] rounded"
          >
            تولید JSON-LD
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {jsonOut ? (
        <Card className="p-4">
          <pre className="text-xs overflow-auto bg-[var(--surface-2)] p-3 rounded">{jsonOut}</pre>
          <button type="button" onClick={copy} className="mt-2 px-3 py-1 border rounded text-sm">
            کپی
          </button>
        </Card>
      ) : null}
    </div>
  );
}
