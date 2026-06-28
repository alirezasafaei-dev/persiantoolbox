'use client';

import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type State = 'idle' | 'model-loading' | 'processing' | 'done' | 'error';

export default function ImageBackgroundRemover() {
  const [state, setState] = useState<State>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected?.type.startsWith('image/')) {
      return;
    }

    setFile(selected);
    setResultUrl(null);
    setResultBlob(null);
    setState('idle');
    setError('');

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }, []);

  const handleRemove = useCallback(async () => {
    if (!file) {
      return;
    }

    setState('model-loading');
    setProgress('در حال بارگذاری مدل هوش مصنوعی...');

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      setState('processing');
      setProgress('در حال حذف پس‌زمینه...');

      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            if (key === 'fetch:model') {
              setProgress(`بارگذاری مدل: ${pct}%`);
            } else if (key === 'compute:inference') {
              setProgress(`پردازش تصویر: ${pct}%`);
            }
          }
        },
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultBlob(blob);
      setState('done');
    } catch {
      setError('خطا در حذف پس‌زمینه. ممکن است تصویر خیلی بزرگ باشد.');
      setState('error');
    }
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) {
      return;
    }
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}-no-bg.png`;
    a.click();
  }, [resultUrl, file]);

  const handleReset = useCallback(() => {
    setState('idle');
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setResultBlob(null);
    setError('');
    setProgress('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">حذف پس‌زمینه تصویر</h2>

          <div className="border-2 border-dashed border-[var(--border-medium)] rounded-lg p-8 text-center">
            <p className="text-[var(--text-secondary)] mb-4">تصویر را انتخاب کنید</p>
            <input
              ref={inputRef}
              id="bg-remove-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="bg-remove-upload" className="cursor-pointer">
              <span className="text-[var(--color-primary)] hover:underline">انتخاب تصویر</span>
            </label>
            {file ? (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {file.name} — {formatBytes(file.size)}
              </p>
            ) : null}
          </div>

          {preview && !resultUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="تصویر اصلی"
                  className="max-h-80 rounded-lg border border-[var(--border-light)]"
                />
              </div>

              {(state === 'model-loading' || state === 'processing') && (
                <div className="flex items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
                  <LoadingSpinner size="sm" />
                  <span>{progress}</span>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleRemove}
                  disabled={state === 'model-loading' || state === 'processing'}
                >
                  {state === 'idle' ? 'حذف پس‌زمینه' : 'در حال پردازش...'}
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  تصویر جدید
                </Button>
              </div>
            </div>
          ) : null}

          {state === 'error' && error ? (
            <div className="p-4 bg-[rgba(239,68,68,0.12)] rounded-[var(--radius-md)] text-[var(--color-danger)] text-sm">
              {error}
            </div>
          ) : null}

          {resultUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div
                  className="max-h-80 rounded-lg border border-[var(--border-light)]"
                  style={{
                    backgroundImage:
                      'repeating-conic-gradient(var(--border-light) 0% 25%, transparent 0% 50%)',
                    backgroundSize: '16px 16px',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resultUrl} alt="تصویر بدون پس‌زمینه" className="max-h-80 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-4 justify-center text-sm text-[var(--text-muted)]">
                <span>حجم: {resultBlob ? formatBytes(resultBlob.size) : '-'}</span>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleDownload}>دانلود بدون پس‌زمینه</Button>
                <Button variant="secondary" onClick={handleReset}>
                  تصویر جدید
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
