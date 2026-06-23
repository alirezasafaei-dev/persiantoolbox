'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';
import Button from '@/shared/ui/Button';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = useCallback(() => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
      setError(null);
    } catch (e) {
      setError(mode === 'decode' ? 'متن ورودی Base64 معتبر نیست' : 'خطا در پردازش');
      setOutput('');
    }
  }, [input, mode]);

  const copyToClipboard = useCallback(() => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  }, [output]);

  const swap = useCallback(() => {
    setInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
  }, [output, mode]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">رمزگذاری Base64</h2>
        <p className="text-sm text-[var(--text-muted)]">
          متن را به Base64 تبدیل کنید یا Base64 را به متن برگردانید.
        </p>

        <div className="flex gap-2">
          <Button
            variant={mode === 'encode' ? 'primary' : 'secondary'}
            onClick={() => setMode('encode')}
          >
            رمزگذاری
          </Button>
          <Button
            variant={mode === 'decode' ? 'primary' : 'secondary'}
            onClick={() => setMode('decode')}
          >
            رمزگشایی
          </Button>
        </div>

        <textarea
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          placeholder={
            mode === 'encode' ? 'متن مورد نظر را وارد کنید...' : 'Base64 را وارد کنید...'
          }
          className="w-full h-32 px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] font-mono text-sm text-[var(--text-primary)] resize-y"
          dir="ltr"
        />

        <div className="flex gap-2">
          <Button onClick={process} disabled={!input} fullWidth>
            {mode === 'encode' ? 'رمزگذاری' : 'رمزگشایی'}
          </Button>
          {output && (
            <Button variant="secondary" onClick={swap} fullWidth>
              جابجایی
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.1)]">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </Card>
      )}

      {output && (
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
        </Card>
      )}
    </div>
  );
}
