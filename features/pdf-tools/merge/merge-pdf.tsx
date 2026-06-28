'use client';

import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Button, Card, ProgressBar } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

type SelectedFile = {
  file: File;
  id: string;
};

const MAX_FILE_SIZE_MB = 50;
const MAX_TOTAL_SIZE_MB = 200;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
const WARNING_THRESHOLD_PERCENT = 80;

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} بایت`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

export default function MergePdfPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<PdfWorkerClient | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const getWorker = () => {
    if (!workerRef.current) {
      workerRef.current = createPdfWorkerClient();
    }
    return workerRef.current;
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const totalSize = useMemo(() => files.reduce((sum, item) => sum + item.file.size, 0), [files]);

  const onSelectFiles = (fileList: FileList | null) => {
    setError(null);
    if (!fileList || fileList.length === 0) {
      return;
    }

    const next: SelectedFile[] = [];
    const errors: string[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: فقط فایل PDF پشتیبانی می‌شود.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: حجم فایل از ${MAX_FILE_SIZE_MB} مگابایت بیشتر است.`);
        return;
      }
      const projectedTotal =
        totalSize + next.reduce((sum, item) => sum + item.file.size, 0) + file.size;
      if (projectedTotal > MAX_TOTAL_SIZE_BYTES) {
        errors.push(`حجم کل فایل‌ها از ${MAX_TOTAL_SIZE_MB} مگابایت بیشتر می‌شود.`);
        return;
      }
      next.push({
        file,
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      });
    });

    if (errors.length > 0) {
      setError(errors.slice(0, 3).join(' | '));
    }

    if (next.length === 0) {
      if (errors.length === 0) {
        setError('فقط فایل های PDF قابل انتخاب هستند.');
      }
      return;
    }

    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const onDragStart = (index: number) => {
    setDragIndex(index);
  };

  const onDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      return;
    }
    setFiles((prev) => {
      const next = [...prev];
      const moved = next[dragIndex];
      if (!moved) {
        return prev;
      }
      next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  };

  const onDragEnd = () => {
    setDragIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) {
      return;
    }
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1]!;
      next[index - 1] = temp!;
      return next;
    });
  };

  const moveDown = (index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) {
        return prev;
      }
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1]!;
      next[index + 1] = temp!;
      return next;
    });
  };

  const onMerge = async () => {
    setError(null);
    setProgress(0);
    if (files.length < 2) {
      setError('حداقل دو فایل برای ادغام لازم است.');
      return;
    }

    setBusy(true);
    try {
      const buffers = await Promise.all(files.map((item) => item.file.arrayBuffer()));
      const worker = getWorker();
      const result = await worker.request({ type: 'merge', files: buffers }, (value) =>
        setProgress(Math.round(value * 100)),
      );
      const blob = new Blob([result.buffer], { type: 'application/pdf' });

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">ادغام PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            چند فایل PDF را به یک فایل واحد تبدیل کنید
          </p>
        </div>

        <Card className="p-6 space-y-4" aria-busy={busy}>
          <div className="flex flex-col gap-3">
            <label
              htmlFor="merge-pdf-files"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              فایل‌های PDF خود را اینجا بکشید یا انتخاب کنید
            </label>
            <div
              className="relative rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-medium)] bg-[var(--surface-2)] p-8 text-center transition-colors hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  'border-[var(--color-primary)]',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  'border-[var(--color-primary)]',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  'border-[var(--color-primary)]',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
                onSelectFiles(e.dataTransfer.files);
              }}
            >
              <input
                id="merge-pdf-files"
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => onSelectFiles(e.target.files)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'merge-pdf-error' : 'merge-pdf-help'}
              />
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  فایل‌های PDF را اینجا بکشید
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  یا کلیک کنید تا فایل انتخاب کنید
                </div>
              </div>
            </div>
            <div id="merge-pdf-help" className="text-xs text-[var(--text-muted)]">
              می‌توانید چند فایل PDF را هم‌زمان انتخاب کنید.
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-muted)]">
                فایل‌ها را بکشید و رها کنید یا از دکمه‌های بالا/پایین استفاده کنید.
              </p>
              {files.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  className={`flex items-center justify-between rounded-[var(--radius-md)] border bg-[var(--surface-1)] px-4 py-3 cursor-grab active:cursor-grabbing transition-colors ${
                    dragIndex === index
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--border-light)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-muted)] select-none">⋮⋮</span>
                    <div className="text-sm text-[var(--text-primary)]">
                      {index + 1}. {item.file.name}{' '}
                      <span className="text-xs text-[var(--text-muted)]">
                        ({formatSize(item.file.size)})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                      aria-label="انتقال به بالا"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === files.length - 1}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                      aria-label="انتقال به پایین"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="text-sm text-[var(--color-danger)] hover:brightness-90"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2">
                <span>حجم کل: {formatSize(totalSize)}</span>
                <span>{files.length} فایل</span>
              </div>
              {totalSize > (MAX_TOTAL_SIZE_BYTES * WARNING_THRESHOLD_PERCENT) / 100 && (
                <div
                  className="rounded-[var(--radius-md)] border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 px-4 py-2 text-xs text-yellow-700 dark:text-yellow-300"
                  role="alert"
                >
                  ⚠️ حجم فایل‌ها زیاد است. پردازش ممکن است کند شود یا مرورگر کرش کند. حداکثر حجم
                  توصیه‌شده: {MAX_TOTAL_SIZE_MB} مگابایت.
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-[var(--text-muted)]">
              تعداد فایل ها: {files.length} | حجم کل: {(totalSize / 1024 / 1024).toFixed(2)} MB
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFiles([])}
                disabled={busy || files.length === 0}
              >
                پاک کردن لیست
              </Button>
              <Button type="button" onClick={onMerge} disabled={busy}>
                {busy ? 'در حال ادغام...' : 'ادغام PDF'}
              </Button>
            </div>
          </div>

          {busy ? <ProgressBar value={progress} /> : null}

          {error ? (
            <Alert id="merge-pdf-error" variant="danger">
              {error}
            </Alert>
          ) : null}

          {downloadUrl ? (
            <Alert variant="success">
              فایل آماده است.{' '}
              <a
                className="font-semibold underline"
                href={downloadUrl}
                download="merged.pdf"
                onClick={() =>
                  void recordHistory({
                    tool: 'pdf-merge',
                    inputSummary: `تعداد فایل: ${files.length}`,
                    outputSummary: 'دانلود فایل ادغام‌شده',
                  })
                }
              >
                دانلود فایل
              </a>
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
