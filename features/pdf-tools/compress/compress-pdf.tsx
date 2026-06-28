'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Button, Card, ProgressBar } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import { formatBytesFa } from '@/shared/utils/format';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type SelectedFile = {
  file: File;
  id: string;
  result?: { buffer: ArrayBuffer; originalSize: number };
};

export default function CompressPdfPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<{ name: string; url: string }[]>([]);
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
      downloadUrls.forEach((d) => URL.revokeObjectURL(d.url));
    };
  }, [downloadUrls]);

  const totalSize = useMemo(() => files.reduce((sum, item) => sum + item.file.size, 0), [files]);

  const onSelectFiles = (fileList: FileList | null) => {
    setError(null);
    setDownloadUrls([]);
    setFiles((prev) => prev.filter((f) => !f.result));

    if (!fileList || fileList.length === 0) {
      return;
    }

    const next: SelectedFile[] = [];
    const errors: string[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: فقط فایل PDF.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: حجم بیشتر از ${MAX_FILE_SIZE_MB}MB.`);
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

    setFiles((prev) => {
      const existing = prev.filter((f) => !f.result);
      return [...existing, ...next];
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onCompress = async () => {
    setError(null);
    setProgress(0);
    if (files.length === 0) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }

    setBusy(true);
    const results: { name: string; url: string }[] = [];

    try {
      const worker = getWorker();
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const item = files[i];
        if (!item) {
          continue;
        }
        const buffer = await item.file.arrayBuffer();
        const result = await worker.request({ type: 'compress', file: buffer }, (value) => {
          const fileProgress = (i + value) / total;
          setProgress(Math.round(fileProgress * 100));
        });

        const blob = new Blob([result.buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const compressedName = item.file.name.replace('.pdf', '_compressed.pdf');
        results.push({ name: compressedName, url });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, result: { buffer: result.buffer, originalSize: item.file.size } }
              : f,
          ),
        );
      }

      setDownloadUrls(results);
      void recordHistory({
        tool: 'pdf-compress',
        inputSummary: `تعداد فایل: ${total}`,
        outputSummary: `فشرده‌سازی ${total} فایل`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const totalOriginal = files.reduce((s, f) => s + f.file.size, 0);
  const totalCompressed = files.reduce((s, f) => s + (f.result?.buffer.byteLength ?? 0), 0);
  const savedPercent =
    totalOriginal > 0 && totalCompressed > 0
      ? Math.max(0, ((totalOriginal - totalCompressed) / totalOriginal) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">فشرده سازی PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            کاهش حجم فایل PDF — پشتیبانی از چند فایل هم‌زمان
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="compress-pdf-files"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              فایل PDF خود را اینجا بکشید یا انتخاب کنید
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
                id="compress-pdf-files"
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => onSelectFiles(e.target.files)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  فایل PDF را اینجا بکشید
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  یا کلیک کنید تا فایل انتخاب کنید
                </div>
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              می‌توانید چند فایل PDF را هم‌زمان انتخاب و فشرده کنید.
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3"
                >
                  <div className="text-sm text-[var(--text-primary)]">
                    {index + 1}. {item.file.name}{' '}
                    <span className="text-xs text-[var(--text-muted)]">
                      ({formatBytesFa(item.file.size)}
                      {item.result
                        ? ` → ${formatBytesFa(item.result.buffer.byteLength)} (${Math.max(0, ((item.file.size - item.result.buffer.byteLength) / item.file.size) * 100).toFixed(1)}% ↓)`
                        : ''}
                      )
                    </span>
                  </div>
                  {!item.result && (
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="text-sm text-[var(--color-danger)] hover:brightness-90"
                    >
                      حذف
                    </button>
                  )}
                  {item.result ? (
                    <a
                      href={
                        downloadUrls.find((d) =>
                          d.name.includes(item.file.name.replace('.pdf', '')),
                        )?.url ?? '#'
                      }
                      download={item.file.name.replace('.pdf', '_compressed.pdf')}
                      className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      دانلود
                    </a>
                  ) : null}
                </div>
              ))}
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2">
                <span>حجم کل: {formatBytesFa(totalSize)}</span>
                <span>{files.length} فایل</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFiles([]);
                setDownloadUrls([]);
              }}
              disabled={busy || files.length === 0}
            >
              پاک کردن لیست
            </Button>
            <Button type="button" onClick={onCompress} disabled={busy || files.length === 0}>
              {busy
                ? `در حال فشرده سازی... (${Math.round(progress)}%)`
                : `فشرده سازی ${files.length > 1 ? `${files.length} فایل` : 'PDF'}`}
            </Button>
          </div>

          {busy ? <ProgressBar value={progress} /> : null}

          {error ? <Alert variant="danger">{error}</Alert> : null}

          {savedPercent > 0 && (
            <Alert variant="success" className="space-y-2">
              <div>
                حجم کل: {formatBytesFa(totalOriginal)} → {formatBytesFa(totalCompressed)} | صرفه
                جویی: {savedPercent.toFixed(1)}%
              </div>
              <div className="text-xs opacity-80">
                توجه: میزان کاهش حجم بسته به ساختار فایل متفاوت است.
              </div>
            </Alert>
          )}
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
