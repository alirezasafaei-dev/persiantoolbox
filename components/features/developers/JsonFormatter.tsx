'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError(`JSON نامعتبر است: ${(err as Error).message}`);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (err) {
      setError(`JSON نامعتبر است: ${(err as Error).message}`);
      setOutput('');
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">فرمت‌کننده JSON</h3>
        <p className="text-sm text-[var(--text-muted)]">JSON خود را فرمت یا مینیفای کنید.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            JSON ورودی
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="w-full h-48 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-y font-mono"
            dir="ltr"
            aria-label="JSON ورودی"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            تعداد فاصله: {indentSize}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="2"
            value={indentSize}
            onChange={(e) => setIndentSize(Number.parseInt(e.target.value))}
            className="w-full"
            aria-label="تعداد فاصله"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={formatJson}
            disabled={!input}
            className="flex-1 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            فرمت
          </button>
          <button
            type="button"
            onClick={minifyJson}
            disabled={!input}
            className="flex-1 bg-[var(--surface-2)] text-[var(--text-primary)] px-4 py-2 rounded-md hover:bg-[var(--surface-3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            مینیفای
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            پاک کردن
          </button>
        </div>

        {error ? (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-500">
            {error}
          </div>
        ) : null}

        {output ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                JSON خروجی
              </label>
              <button
                type="button"
                onClick={copyOutput}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                کپی
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-48 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-primary)] resize-y font-mono"
              dir="ltr"
              aria-label="JSON خروجی"
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
