'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const processBase64 = () => {
    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
      }
    } catch (err) {
      setOutput(`خطا: ${(err as Error).message}`);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">
          Base64 Encoder/Decoder
        </h3>
        <p className="text-sm text-[var(--text-muted)]">متن را به Base64 تبدیل کنید یا برعکس.</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setMode('encode')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${mode === 'encode' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-primary)]'}`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${mode === 'decode' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-primary)]'}`}
          >
            Decode
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            {mode === 'encode' ? 'متن ورودی' : 'Base64 ورودی'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'متن خود را وارد کنید...' : 'Base64 را وارد کنید...'}
            className="w-full h-32 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-y"
            dir="auto"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={processBase64}
            disabled={!input}
            className="flex-1 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          <button
            onClick={clearAll}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            پاک کردن
          </button>
        </div>

        {output && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                {mode === 'encode' ? 'Base64 خروجی' : 'متن خروجی'}
              </label>
              <button
                onClick={copyOutput}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                کپی
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-32 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-primary)] resize-y font-mono"
              dir="ltr"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
