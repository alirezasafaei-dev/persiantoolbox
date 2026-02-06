'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

type SelectedFile = {
  file: File;
  id: string;
};

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
    Array.from(fileList).forEach((file) => {
      if (file.type !== 'application/pdf') {
        return;
      }
      next.push({
        file,
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      });
    });

    if (next.length === 0) {
      setError('فقط فایل های PDF قابل انتخاب هستند.');
      return;
    }

    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
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
              انتخاب فایل های PDF
            </label>
            <input
              id="merge-pdf-files"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => onSelectFiles(e.target.files)}
              className="input-field"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'merge-pdf-error' : 'merge-pdf-help'}
            />
            <div id="merge-pdf-help" className="text-xs text-[var(--text-muted)]">
              می‌توانید چند فایل PDF را هم‌زمان انتخاب کنید.
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
                    {index + 1}. {item.file.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="text-sm text-[var(--color-danger)] hover:brightness-90"
                  >
                    حذف
                  </button>
                </div>
              ))}
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

          {busy && (
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-[var(--text-muted)]" role="status" aria-live="polite">
                {progress}%
              </div>
            </div>
          )}

          {error && (
            <Alert id="merge-pdf-error" variant="danger">
              {error}
            </Alert>
          )}

          {downloadUrl && (
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
