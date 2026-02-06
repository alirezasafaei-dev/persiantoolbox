'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { parsePageOrder } from '@/features/pdf-tools/utils/pageOrder';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

const unique = (values: number[]) => new Set(values).size === values.length;

export default function ReorderPagesPage() {
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
      setPagesInput(`1-${pages}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
      return;
    }

    setFile(selected);
  };

  const onReorder = async () => {
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
      const order = parsePageOrder(pagesInput, totalPages);
      if (order.length !== totalPages) {
        throw new Error('باید همه صفحات را دقیقاً یکبار مشخص کنید.');
      }
      if (!unique(order)) {
        throw new Error('شماره صفحات نباید تکراری باشد.');
      }

      const worker = getWorker();
      const result = await worker.request({ type: 'reorder', file: buffer, pages: order }, (v) =>
        setProgress(Math.round(v * 100)),
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

  const isValidPreview = useMemo(() => {
    if (!totalPages) {
      return null;
    }
    try {
      const order = parsePageOrder(pagesInput, totalPages);
      return order.length === totalPages && unique(order);
    } catch {
      return false;
    }
  }, [pagesInput, totalPages]);

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            جابجایی ترتیب صفحات
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            ترتیب صفحات فایل PDF را به دلخواه تغییر دهید
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="reorder-pages-file"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              انتخاب فایل PDF
            </label>
            <input
              id="reorder-pages-file"
              type="file"
              accept="application/pdf"
              onChange={(e) => onSelectFile(e.target.files)}
              className="input-field"
            />
          </div>

          {file && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {file.name} | تعداد صفحات: {totalPages ?? '-'}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label
              htmlFor="reorder-pages-input"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              ترتیب جدید صفحات
            </label>
            <input
              id="reorder-pages-input"
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="مثال: 3,2,1,4"
              className="input-field"
            />
            <div className="text-xs text-[var(--text-muted)]">
              همه صفحات باید یکبار مشخص شوند. مثال: 1-3,5,4
            </div>
          </div>

          {isValidPreview === false && (
            <div className="text-xs text-[var(--color-danger)]">ترتیب صفحات کامل یا یکتا نیست.</div>
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
            <Button type="button" onClick={onReorder} disabled={busy}>
              {busy ? 'در حال جابجایی...' : 'جابجایی صفحات'}
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

          {downloadUrl && (
            <Alert variant="success">
              فایل آماده است.{' '}
              <a
                className="font-semibold underline"
                href={downloadUrl}
                download="reordered.pdf"
                onClick={() =>
                  void recordHistory({
                    tool: 'pdf-reorder',
                    inputSummary: `ترتیب صفحات: ${pagesInput}`,
                    outputSummary: 'دانلود فایل مرتب‌شده',
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
