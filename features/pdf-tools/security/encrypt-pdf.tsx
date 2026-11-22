'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { Card, Button } from '@/components/ui';
import Alert from '@/shared/ui/Alert';

type State = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';

export default function EncryptPdfPage() {
  const [state, setState] = useState<State>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const fileRef = useRef<File | null>(null);
  const workerRef = useRef<PdfWorkerClient | null>(null);
  const outputUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      if (outputUrlRef.current) {
        URL.revokeObjectURL(outputUrlRef.current);
      }
    },
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('فقط فایل PDF مجاز است.');
      setState('error');
      return;
    }

    if (!file.size || file.size > 50 * 1024 * 1024) {
      setError('یک فایل PDF غیرخالی با حجم حداکثر ۵۰ مگابایت انتخاب کنید.');
      setState('error');
      return;
    }
    setState('loading');
    setError('');

    try {
      const worker = (workerRef.current ??= createPdfWorkerClient({ preserveDocument: true }));
      const count = await worker.countPages({ file: await file.arrayBuffer() });
      if (workerRef.current !== worker) {
        return;
      }
      fileRef.current = file;
      setFileName(file.name);
      setPageCount(count);
      setState('ready');
    } catch {
      setError('فایل PDF سالم و بدون رمز انتخاب کنید.');
      setState('error');
    }
  }, []);

  const handleEncrypt = useCallback(async () => {
    if (!fileRef.current || !password) {
      setError('رمز عبور الزامی است.');
      return;
    }

    const encoder = new TextEncoder();
    if (
      [password, ownerPassword].some(
        (value) => value.includes('\0') || encoder.encode(value).byteLength > 127,
      )
    ) {
      setError('هر رمز باید حداکثر ۱۲۷ بایت و بدون نویسهٔ تهی باشد.');
      return;
    }
    setState('processing');
    setError('');

    try {
      const worker = (workerRef.current ??= createPdfWorkerClient({ preserveDocument: true }));
      const owner =
        ownerPassword ||
        Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) =>
          byte.toString(16).padStart(2, '0'),
        ).join('');
      const file = await fileRef.current.arrayBuffer();
      if (workerRef.current !== worker) {
        return;
      }
      const result = await worker.request({
        type: 'encrypt',
        file,
        password,
        ownerPassword: owner,
      });
      if (workerRef.current !== worker) {
        return;
      }

      const blob = new Blob([result.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (outputUrlRef.current) {
        URL.revokeObjectURL(outputUrlRef.current);
      }
      outputUrlRef.current = url;

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace(/\.pdf$/i, '')}_protected.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setPassword('');
      setOwnerPassword('');
      setState('done');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در پردازش فایل.');
      setState('ready');
    }
  }, [fileName, password, ownerPassword]);

  const handleReset = useCallback(() => {
    setState('idle');
    setFileName('');
    setError('');
    setPageCount(0);
    setPassword('');
    setOwnerPassword('');
    fileRef.current = null;
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">رمزگذاری PDF</h1>
        <p className="text-lg text-(--text-secondary)">محافظت از فایل PDF با رمز عبور</p>
        <p className="mt-2 text-sm text-(--text-muted)">
          بازنویسی فایل می‌تواند اعتبار امضای دیجیتال را از بین ببرد.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        {state === 'idle' && (
          <div className="space-y-4">
            <div
              className="relative rounded-md border-2 border-dashed border-(--border-medium) bg-(--surface-2) p-8 text-center transition-colors hover:border-primary hover:bg-[rgb(var(--color-primary-rgb)/0.05)]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  'border-primary',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  'border-primary',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  'border-primary',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && inputRef.current) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(droppedFile);
                  inputRef.current.files = dataTransfer.files;
                  inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                aria-label="انتخاب فایل PDF"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">🔒</div>
                <div className="text-sm font-semibold text-(--text-primary)">
                  فایل PDF را اینجا بکشید
                </div>
                <div className="text-xs text-(--text-muted)">یا کلیک کنید تا فایل انتخاب کنید</div>
              </div>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="text-center text-(--text-muted) py-4">در حال بارگذاری فایل...</div>
        )}

        {(state === 'ready' || state === 'processing' || state === 'done') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-secondary)">فایل:</span>
              <span className="font-medium text-(--text-primary)">{fileName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-secondary)">تعداد صفحات:</span>
              <span className="font-medium text-(--text-primary)">{pageCount}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-(--text-primary) mb-1">
                  رمز عبور (الزامی)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  className="w-full px-4 py-2 bg-(--surface-1) border border-(--border-medium) rounded-md text-sm text-(--text-primary)"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text-primary) mb-1">
                  رمز عبور مالک (اختیاری)
                </label>
                <input
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="برای تنظیمات امنیتی پیشرفته"
                  className="w-full px-4 py-2 bg-(--surface-1) border border-(--border-medium) rounded-md text-sm text-(--text-primary)"
                  dir="ltr"
                />
              </div>
            </div>

            <Alert variant="info" title="نحوه عملکرد">
              این ابزار فایل PDF شما را با رمزگذاری AES-256 محافظت می‌کند. تمام پردازش‌ها در مرورگر
              شما انجام می‌شود و فایل به هیچ سروری ارسال نمی‌شود.
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleEncrypt}
                disabled={state === 'processing' || state === 'done' || !password}
              >
                {(() => {
                  if (state === 'processing') {
                    return 'در حال پردازش...';
                  }
                  if (state === 'done') {
                    return 'دانلود شد';
                  }
                  return 'پردازش و دانلود';
                })()}
              </Button>
              <Button variant="secondary" onClick={handleReset} disabled={state === 'processing'}>
                فایل جدید
              </Button>
            </div>
          </div>
        )}

        {error ? <Alert variant="danger">{error}</Alert> : null}
        {state === 'error' ? <Button onClick={handleReset}>انتخاب فایل دیگر</Button> : null}

        {state === 'done' && (
          <Alert variant="success">فایل با موفقیت پردازش شد و دانلود آغاز شد.</Alert>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-(--text-primary) mb-3">نکات امنیتی</h3>
        <ul className="space-y-2 text-sm text-(--text-muted)">
          <li>- تمام پردازش‌ها به صورت محلی در مرورگر شما انجام می‌شود.</li>
          <li>- فایل شما به هیچ سروری ارسال نمی‌شود.</li>
          <li>- فایل خروجی با رمزگذاری AES-256 محافظت می‌شود.</li>
        </ul>
      </Card>
    </div>
  );
}
