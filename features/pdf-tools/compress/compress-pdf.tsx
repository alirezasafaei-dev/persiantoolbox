'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(2)} ${units[index]}`;
}

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
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

  const onSelectFile = (fileList: FileList | null) => {
    setError(null);
    setResultSize(null);
    setDownloadUrl(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const selected = fileList[0];
    if (!selected || selected.type !== 'application/pdf') {
      setError('فقط فایل PDF قابل انتخاب است.');
      return;
    }

    setFile(selected);
  };

  const onCompress = async () => {
    setError(null);
    setProgress(0);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }

    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const worker = getWorker();
      const result = await worker.request({ type: 'compress', file: buffer }, (value) =>
        setProgress(Math.round(value * 100)),
      );
      const blob = new Blob([result.buffer], { type: 'application/pdf' });

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const originalSize = file?.size ?? 0;
  const savedPercent = resultSize
    ? Math.max(0, ((originalSize - resultSize) / originalSize) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">فشرده سازی PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            کاهش حجم فایل PDF بدون ارسال به سرور
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="compress-pdf-file"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              انتخاب فایل PDF
            </label>
            <input
              id="compress-pdf-file"
              type="file"
              accept="application/pdf"
              onChange={(e) => onSelectFile(e.target.files)}
              className="input-field"
            />
          </div>

          {file && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {file.name} | حجم اولیه: {formatBytes(originalSize)}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFile(null)}
              disabled={busy || !file}
            >
              تغییر فایل
            </Button>
            <Button type="button" onClick={onCompress} disabled={busy}>
              {busy ? 'در حال فشرده سازی...' : 'فشرده سازی PDF'}
            </Button>
          </div>

          {busy && (
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-[var(--text-muted)]">{progress}%</div>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {downloadUrl && resultSize !== null && (
            <Alert variant="success" className="space-y-2">
              <div>
                حجم جدید: {formatBytes(resultSize)} | صرفه جویی: {savedPercent.toFixed(1)}%
              </div>
              <div>
                <a
                  className="font-semibold underline"
                  href={downloadUrl}
                  download="compressed.pdf"
                  onClick={() =>
                    void recordHistory({
                      tool: 'pdf-compress',
                      inputSummary: `فایل: ${file?.name ?? ''}`,
                      outputSummary: `دانلود فایل با حجم ${formatBytes(resultSize)}`,
                    })
                  }
                >
                  دانلود فایل
                </a>
              </div>
              <div className="text-xs text-[rgb(var(--color-success-rgb)/0.8)]">
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
