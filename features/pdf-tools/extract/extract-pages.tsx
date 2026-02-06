'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { parsePageRanges } from '@/features/pdf-tools/utils/pageRanges';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

export default function ExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesInput, setPagesInput] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
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

  const onSelectFile = async (fileList: FileList | null) => {
    setError(null);
    setTotalPages(null);
    setDownloadUrl(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const selected = fileList[0];
    if (!selected || selected.type !== 'application/pdf') {
      setError('فقط فایل PDF قابل انتخاب است.');
      return;
    }

    try {
      const worker = getWorker();
      const buffer = await selected.arrayBuffer();
      const pages = await worker.countPages({ file: buffer });
      setTotalPages(pages);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
      return;
    }

    setFile(selected);
  };

  const onExtract = async () => {
    setError(null);
    setProgress(0);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }
    if (!totalPages) {
      setError('تعداد صفحات فایل مشخص نیست.');
      return;
    }

    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const pages = parsePageRanges(pagesInput, totalPages);
      if (pages.length === 0) {
        throw new Error('هیچ صفحه ای انتخاب نشده است.');
      }

      const worker = getWorker();
      const result = await worker.request({ type: 'split', file: buffer, pages }, (value) =>
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
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">استخراج صفحات PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            صفحات دلخواه را از فایل PDF استخراج کنید
          </p>
        </div>

        <Card className="p-6 space-y-4" aria-busy={busy}>
          <div className="flex flex-col gap-3">
            <label
              htmlFor="extract-pages-file"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              انتخاب فایل PDF
            </label>
            <input
              id="extract-pages-file"
              type="file"
              accept="application/pdf"
              onChange={(e) => onSelectFile(e.target.files)}
              className="input-field"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'extract-pages-error' : undefined}
            />
          </div>

          {file && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {file.name} | تعداد صفحات: {totalPages ?? '-'}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label
              htmlFor="extract-pages-input"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              صفحات مورد نظر
            </label>
            <input
              id="extract-pages-input"
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="مثال: 1-3,5,8"
              className="input-field"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'extract-pages-help extract-pages-error' : 'extract-pages-help'
              }
            />
            <div id="extract-pages-help" className="text-xs text-[var(--text-muted)]">
              می‌توانید از بازه استفاده کنید (1-3) یا صفحات جداگانه را با کاما جدا کنید.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFile(null)}
              disabled={busy || !file}
            >
              تغییر فایل
            </Button>
            <Button type="button" onClick={onExtract} disabled={busy}>
              {busy ? 'در حال استخراج...' : 'استخراج صفحات'}
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
              <div className="text-xs text-[var(--text-muted)]" role="status" aria-live="polite">
                {progress}%
              </div>
            </div>
          )}

          {error && (
            <Alert id="extract-pages-error" variant="danger">
              {error}
            </Alert>
          )}

          {downloadUrl && (
            <Alert variant="success">
              فایل آماده است.{' '}
              <a
                className="font-semibold underline"
                href={downloadUrl}
                download="extracted.pdf"
                onClick={() =>
                  void recordHistory({
                    tool: 'pdf-extract-pages',
                    inputSummary: `صفحات: ${pagesInput}`,
                    outputSummary: 'دانلود فایل استخراج‌شده',
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
