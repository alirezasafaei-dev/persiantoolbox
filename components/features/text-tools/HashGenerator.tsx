'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';
import Button from '@/shared/ui/Button';

async function hashString(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const ALGORITHMS = [
  { id: 'SHA-1', label: 'SHA-1' },
  { id: 'SHA-256', label: 'SHA-256' },
  { id: 'SHA-384', label: 'SHA-384' },
  { id: 'SHA-512', label: 'SHA-512' },
] as const;

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const generate = useCallback(async () => {
    if (!input) {
      return;
    }
    setProcessing(true);
    try {
      const hashes: Record<string, string> = {};
      for (const algo of ALGORITHMS) {
        hashes[algo.id] = await hashString(algo.id, input);
      }
      setResults(hashes);
    } finally {
      setProcessing(false);
    }
  }, [input]);

  const copyHash = useCallback((hash: string) => {
    navigator.clipboard.writeText(hash);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">تولید هش</h2>
        <p className="text-sm text-[var(--text-muted)]">
          متن خود را با الگوریتم‌های مختلف هش رمزگذاری کنید. تمام پردازش‌ها محلی است.
        </p>

        <textarea
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          placeholder="متن مورد نظر را وارد کنید..."
          className="w-full h-32 px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] resize-y"
        />

        <Button onClick={generate} disabled={!input || processing} fullWidth>
          {processing ? 'در حال پردازش...' : 'تولید هش'}
        </Button>
      </Card>

      {Object.keys(results).length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">نتایج هش</h3>
          <div className="space-y-3">
            {ALGORITHMS.map((algo) => (
              <div key={algo.id} className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-muted)] w-20">
                  {algo.label}
                </span>
                <code
                  className="flex-1 p-2 bg-[var(--surface-2)] rounded text-xs font-mono break-all text-[var(--text-primary)]"
                  dir="ltr"
                >
                  {results[algo.id]}
                </code>
                <Button variant="secondary" onClick={() => copyHash(results[algo.id] ?? '')}>
                  کپی
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
