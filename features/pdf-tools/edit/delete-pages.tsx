'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, ProgressBar } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { parsePageRanges } from '@/features/pdf-tools/utils/pageRanges';
import { getPdfEditFileSizeError } from '@/features/pdf-tools/utils/editFileSize';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

const buildRemainingPages = (totalPages: number, removePages: number[]) => {
  const removeSet = new Set(removePages);
  const result: number[] = [];
  for (let i = 0; i < totalPages; i += 1) {
    if (!removeSet.has(i)) {
      result.push(i);
    }
  }
  return result;
};

export default function DeletePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesInput, setPagesInput] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<PdfWorkerClient | null>(null);
  const selectionRef = useRef(0);

  useEffect(() => {
    return () => {
      selectionRef.current += 1;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const getWorker = () => {
    if (!workerRef.current) {
      workerRef.current = createPdfWorkerClient({ preserveDocument: true });
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
    if (busy) {
      return;
    }
    const selection = ++selectionRef.current;
    workerRef.current?.cancel();
    setFile(null);
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

    const sizeError = getPdfEditFileSizeError(selected.size);
    if (sizeError) {
      setError(sizeError);
      return;
    }

    try {
      const buffer = await selected.arrayBuffer();
      if (selectionRef.current !== selection) {
        return;
      }
      const pages = await getWorker().countPages({ file: buffer });
      if (selectionRef.current === selection) {
        setTotalPages(pages);
        setFile(selected);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      if (selectionRef.current === selection) {
        setError(message);
      }
    }
  };

  const onDelete = async () => {
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
      const removePages = parsePageRanges(pagesInput, totalPages);
      if (removePages.length === 0) {
        throw new Error('هیچ صفحه ای انتخاب نشده است.');
      }
      const remainingPages = buildRemainingPages(totalPages, removePages);
      if (remainingPages.length === 0) {
        throw new Error('بعد از حذف هیچ صفحه ای باقی نمی ماند.');
      }

      const worker = getWorker();
      const result = await worker.request(
        { type: 'delete', file: buffer, pages: remainingPages },
        (value) => setProgress(Math.round(value * 100)),
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

  const remainingCount = useMemo(() => {
    if (!totalPages) {
      return null;
    }
    try {
      const removePages = parsePageRanges(pagesInput, totalPages);
      return buildRemainingPages(totalPages, removePages).length;
    } catch {
      return null;
    }
  }, [pagesInput, totalPages]);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">حذف صفحات PDF</h1>
          <p className="text-lg text-(--text-secondary)">صفحات انتخابی را از فایل PDF حذف کنید</p>
        </div>

        <Alert variant="info">
          پیوست‌های سند در خروجی باقی می‌مانند و نشانک‌های صفحات حذف‌شده ممکن است کار نکنند. برای
          حذف اطلاعات محرمانه از ابزار پاک‌سازی سند استفاده کنید.
        </Alert>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="delete-pages-file"
              className="text-sm font-semibold text-(--text-primary)"
            >
              انتخاب فایل PDF
            </label>
            <input
              id="delete-pages-file"
              type="file"
              aria-label="انتخاب فایل PDF"
              accept="application/pdf"
              disabled={busy}
              onChange={(e) => onSelectFile(e.target.files)}
              className="input-field"
            />
          </div>

          {file ? (
            <div className="rounded-md border border-(--border-light) bg-(--surface-1) px-4 py-3 text-sm text-(--text-secondary)">
              {file.name} | تعداد صفحات: {totalPages ?? '-'}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <label
              htmlFor="delete-pages-input"
              className="text-sm font-semibold text-(--text-primary)"
            >
              صفحات مورد نظر برای حذف
            </label>
            <input
              id="delete-pages-input"
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="مثال: 1-3,5,8"
              className="input-field"
            />
            <div className="text-xs text-(--text-muted)">
              می توانید از بازه استفاده کنید (1-3) یا صفحات جداگانه را با کاما جدا کنید.
            </div>
          </div>

          {typeof remainingCount === 'number' && (
            <div className="text-xs text-(--text-muted)">
              پس از حذف، {remainingCount.toLocaleString('fa-IR')} صفحه باقی می ماند.
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
            <Button type="button" onClick={onDelete} disabled={busy}>
              {busy ? 'در حال حذف...' : 'حذف صفحات'}
            </Button>
          </div>

          {busy ? <ProgressBar value={progress} /> : null}

          {error ? <Alert variant="danger">{error}</Alert> : null}

          {downloadUrl ? (
            <Alert variant="success">
              فایل آماده است.{' '}
              <a
                className="font-semibold underline"
                href={downloadUrl}
                download="cleaned.pdf"
                onClick={() =>
                  void recordHistory({
                    tool: 'pdf-delete-pages',
                    inputSummary: `حذف صفحات: ${pagesInput}`,
                    outputSummary: 'دانلود فایل ویرایش‌شده',
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
