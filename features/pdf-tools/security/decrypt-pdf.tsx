'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import { formatBytesFa } from '@/shared/utils/format';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const DECRYPT_TIMEOUT_MS = 90_000;

function decryptInWorker(buffer: ArrayBuffer, password: string, signal: AbortSignal) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    signal.throwIfAborted();
    const worker = new Worker('/pdf-engine/v1/document-worker.mjs', { type: 'module' });
    const release = () => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      worker.terminate();
    };
    const fail = (message: string) => {
      release();
      reject(new Error(message));
    };
    const abort = () => fail('پردازش لغو شد.');
    const timeout = setTimeout(
      () => fail('زمان پردازش به پایان رسید. دوباره تلاش کنید.'),
      DECRYPT_TIMEOUT_MS,
    );
    signal.addEventListener('abort', abort, { once: true });
    const workerError = () => fail('پردازشگر PDF در دسترس نیست. دوباره تلاش کنید.');
    worker.onerror = workerError;
    worker.onmessageerror = workerError;
    worker.onmessage = ({ data }: MessageEvent<{ buffer?: ArrayBuffer; error?: string }>) => {
      if (data?.buffer instanceof ArrayBuffer) {
        release();
        resolve(data.buffer);
        return;
      }
      if (data?.error === 'WRONG_PASSWORD') {
        fail('رمز عبور نادرست است. رمز را بررسی کنید و دوباره تلاش کنید.');
      } else if (data?.error === 'NOT_ENCRYPTED') {
        fail('این فایل PDF رمزگذاری نشده است.');
      } else {
        fail('حذف رمز انجام نشد. سلامت فایل و نوع رمزگذاری را بررسی کنید.');
      }
    };
    try {
      worker.postMessage({ buffer, password }, [buffer]);
    } catch {
      workerError();
    }
  });
}

export default function DecryptPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const currentOperation = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      const operation = currentOperation.current;
      currentOperation.current = null;
      operation?.abort();
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const originalSize = file?.size ?? 0;

  const onSelectFile = (fileList: FileList | null) => {
    if (currentOperation.current) {
      return;
    }
    setError(null);
    setFile(null);
    setPassword('');
    setDownloadUrl(null);
    setResultSize(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const selected = fileList[0];
    if (!selected || selected.type !== 'application/pdf') {
      setError('فقط فایل PDF قابل انتخاب است.');
      return;
    }

    if (selected.size === 0 || selected.size > MAX_FILE_BYTES) {
      setError('یک فایل PDF غیرخالی با حجم حداکثر ۵۰ مگابایت انتخاب کنید.');
      return;
    }
    setFile(selected);
  };

  const onDecrypt = async () => {
    if (currentOperation.current) {
      return;
    }
    setError(null);
    setDownloadUrl(null);
    setResultSize(null);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }

    const operation = new AbortController();
    currentOperation.current = operation;
    setBusy(true);
    try {
      const bytes = await decryptInWorker(await file.arrayBuffer(), password, operation.signal);
      if (currentOperation.current !== operation) {
        return;
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setPassword('');
    } catch (error) {
      if (currentOperation.current === operation) {
        const message = error instanceof Error ? error.message : 'خواندن فایل PDF ناموفق بود.';
        setError(operation.signal.aborted ? 'پردازش لغو شد.' : message);
      }
    } finally {
      if (currentOperation.current === operation) {
        currentOperation.current = null;
        setBusy(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">حذف رمز PDF</h1>
          <p className="text-lg text-(--text-secondary)">
            حذف رمز PDF در مرورگر، با رمز معتبر و اجازهٔ تغییر سند
          </p>
          <p className="mt-2 text-sm text-(--text-muted)">
            بازنویسی PDF می‌تواند اعتبار امضای دیجیتال سند را از بین ببرد.
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="decrypt-pdf-file"
              className="text-sm font-semibold text-(--text-primary)"
            >
              فایل PDF رمزدار را اینجا بکشید یا انتخاب کنید
            </label>
            <div
              className="pdf-file-dropzone relative rounded-md border-2 border-dashed border-(--border-medium) bg-(--surface-2) p-8 text-center transition-colors hover:border-primary hover:bg-[rgb(var(--color-primary-rgb)/0.05)]"
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
                onSelectFile(e.dataTransfer.files);
              }}
            >
              <input
                id="decrypt-pdf-file"
                type="file"
                aria-label="انتخاب فایل PDF"
                accept="application/pdf"
                disabled={busy}
                onChange={(e) => onSelectFile(e.target.files)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">🔓</div>
                <div className="text-sm font-semibold text-(--text-primary)">
                  فایل PDF رمزدار را اینجا بکشید
                </div>
                <div className="text-xs text-(--text-muted)">یا کلیک کنید تا فایل انتخاب کنید</div>
              </div>
            </div>
          </div>

          {file ? (
            <div className="rounded-md border border-(--border-light) bg-(--surface-1) px-4 py-3 text-sm text-(--text-secondary)">
              {file.name} | حجم اولیه: {formatBytesFa(originalSize)}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="decrypt-pdf-password"
              className="text-sm font-semibold text-(--text-primary)"
            >
              رمز عبور
            </label>
            <input
              id="decrypt-pdf-password"
              type="password"
              disabled={busy}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز فایل را وارد کنید"
              className="input-field"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (busy) {
                  currentOperation.current?.abort();
                } else {
                  setFile(null);
                  setPassword('');
                  setDownloadUrl(null);
                  setResultSize(null);
                  setError(null);
                }
              }}
              disabled={!file}
            >
              {busy ? 'لغو پردازش' : 'تغییر فایل'}
            </Button>
            <Button type="button" onClick={onDecrypt} disabled={busy}>
              {busy ? 'در حال پردازش...' : 'حذف رمز'}
            </Button>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          {downloadUrl && resultSize !== null ? (
            <Alert variant="success" className="space-y-2">
              <div>حجم خروجی: {formatBytesFa(resultSize)}</div>
              <div>
                <a
                  className="font-semibold underline"
                  href={downloadUrl}
                  download="decrypted.pdf"
                  onClick={() =>
                    void recordHistory({
                      tool: 'pdf-decrypt',
                      inputSummary: 'حذف رمز یک فایل PDF',
                      outputSummary: `دانلود فایل با حجم ${formatBytesFa(resultSize)}`,
                    })
                  }
                >
                  دانلود فایل
                </a>
              </div>
            </Alert>
          ) : null}
        </Card>
        <RecentHistoryCard
          title="آخرین عملیات PDF"
          toolPrefixes={['pdf-']}
          toolIds={['image-to-pdf']}
        />
      </div>
    </div>
  );
}
