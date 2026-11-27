'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Card, ProgressBar } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { parsePageRanges } from '@/features/pdf-tools/utils/pageRanges';
import { getPdfEditFileSizeError } from '@/features/pdf-tools/utils/editFileSize';
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

  const onExtract = async () => {
    setError(null);
    setProgress(0);
    setDownloadUrl(null);
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
      const result = await worker.request({ type: 'extract', file: buffer, pages }, (value) =>
        setProgress(Math.round(value * 100)),
      );
      const blob = new Blob([result.buffer], { type: 'application/pdf' });

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
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">استخراج صفحات PDF</h1>
          <p className="text-lg text-(--text-secondary)">
            صفحات دلخواه را از فایل PDF استخراج کنید
          </p>
        </div>

        <Alert variant="info">
          خروجی شامل صفحات انتخاب‌شده و فرم‌های همان صفحات است. پیوست‌ها، نشانک‌ها و اطلاعات کلی سند
          اصلی منتقل نمی‌شوند.
        </Alert>

        <Card className="p-6 space-y-4" aria-busy={busy}>
          <div className="flex flex-col gap-3">
            <label
              htmlFor="extract-pages-file"
              className="text-sm font-semibold text-(--text-primary)"
            >
              انتخاب فایل PDF
            </label>
            <input
              id="extract-pages-file"
              type="file"
              aria-label="انتخاب فایل PDF"
              accept="application/pdf"
              disabled={busy}
              onChange={(event) => {
                void onSelectFile(event.currentTarget.files);
                event.currentTarget.value = '';
              }}
              className="input-field"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'extract-pages-error' : undefined}
            />
          </div>

          {file ? (
            <div className="rounded-md border border-(--border-light) bg-(--surface-1) px-4 py-3 text-sm text-(--text-secondary)">
              {file.name} | تعداد صفحات: {totalPages ?? '-'}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <label
              htmlFor="extract-pages-input"
              className="text-sm font-semibold text-(--text-primary)"
            >
              صفحات مورد نظر
            </label>
            <input
              id="extract-pages-input"
              type="text"
              value={pagesInput}
              disabled={busy}
              onChange={(e) => {
                setPagesInput(e.target.value);
                setDownloadUrl(null);
              }}
              placeholder="مثال: 1-3,5,8"
              className="input-field"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'extract-pages-help extract-pages-error' : 'extract-pages-help'
              }
            />
            <div id="extract-pages-help" className="text-xs text-(--text-muted)">
              می‌توانید از بازه استفاده کنید (1-3) یا صفحات جداگانه را با کاما جدا کنید.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void onSelectFile(null)}
              disabled={busy || !file}
            >
              تغییر فایل
            </Button>
            <Button type="button" onClick={onExtract} disabled={busy}>
              {busy ? 'در حال استخراج...' : 'استخراج صفحات'}
            </Button>
          </div>

          {busy ? <ProgressBar value={progress} /> : null}

          {error ? (
            <Alert id="extract-pages-error" variant="danger">
              {error}
            </Alert>
          ) : null}

          {downloadUrl ? (
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
