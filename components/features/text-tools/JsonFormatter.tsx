'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';
import Button from '@/shared/ui/Button';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const format = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON نامعتبر');
      setOutput('');
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON نامعتبر');
      setOutput('');
    }
  }, [input]);

  const copyToClipboard = useCallback(() => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  }, [output]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">فرمت‌بندی JSON</h1>
        <p className="text-sm text-[var(--text-muted)]">
          JSON خود را فرمت‌بندی، اعتبارسنجی و فشرده‌سازی کنید.
        </p>

        <textarea
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          className="w-full h-40 px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] font-mono text-sm text-[var(--text-primary)] resize-y"
          dir="ltr"
          aria-label="ورودی JSON"
        />

        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--text-muted)]">تعداد فاصله:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-sm"
            aria-label="تعداد فاصله"
          >
            <option value={2}>۲</option>
            <option value={4}>۴</option>
            <option value={8}>۸</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button onClick={format} fullWidth>
            فرمت‌بندی
          </Button>
          <Button onClick={minify} variant="secondary" fullWidth>
            فشرده‌سازی
          </Button>
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.1)]">
          <p className="text-sm text-[var(--color-danger)] font-mono">{error}</p>
        </Card>
      ) : null}

      {output ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">خروجی</h3>
            <Button variant="secondary" onClick={copyToClipboard}>
              کپی
            </Button>
          </div>
          <pre
            className="p-4 bg-[var(--surface-2)] rounded-lg overflow-x-auto text-sm font-mono text-[var(--text-primary)]"
            dir="ltr"
          >
            {output}
          </pre>
          <p className="text-xs text-[var(--text-muted)]">{output.length} کاراکتر</p>
        </Card>
      ) : null}
    </div>
  );
}
