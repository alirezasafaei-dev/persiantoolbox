'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { loadJsZip } from '@/features/pdf-tools/lazy-deps';
import { toEnglishDigits } from '@/shared/utils/numbers';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesInput, setPagesInput] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const selectionId = useRef(0);
  const splitOperation = useRef<symbol | null>(null);
  const workerRef = useRef<PdfWorkerClient | null>(null);
  const splitButton = useRef<HTMLButtonElement | null>(null);
  const restoreSplitFocus = useRef(false);

  useEffect(() => {
    if (!busy && restoreSplitFocus.current) {
      restoreSplitFocus.current = false;
      splitButton.current?.focus();
    }
  }, [busy]);

  useEffect(() => {
    return () => {
      selectionId.current += 1;
      splitOperation.current = null;
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
    if (splitOperation.current) {
      return;
    }
    const id = ++selectionId.current;
    setError(null);
    setTotalPages(null);
    setFile(null);
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
      if (selected.size === 0 || selected.size > 50 * 1024 * 1024) {
        throw new Error('یک فایل غیرخالی تا ۵۰ مگابایت انتخاب کنید.');
      }
      const buffer = await selected.arrayBuffer();
      if (selectionId.current !== id) {
        return;
      }
      const pages = await getWorker().countPages({ file: buffer });
      if (selectionId.current === id) {
        setTotalPages(pages);
        setFile(selected);
      }
    } catch (e) {
      if (selectionId.current === id) {
        setError(e instanceof Error ? e.message : 'خطای نامشخص رخ داد.');
      }
    }
  };

  const onSplit = async (event: MouseEvent<HTMLButtonElement>) => {
    if (splitOperation.current) {
      return;
    }
    setError(null);
    setDownloadUrl(null);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }
    if (!totalPages) {
      setError('تعداد صفحات فایل مشخص نیست.');
      return;
    }

    const operation = Symbol();
    splitOperation.current = operation;
    splitButton.current = event.currentTarget;
    setProgress(0);
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      if (splitOperation.current !== operation) {
        return;
      }
      const value = toEnglishDigits(pagesInput.trim());
      const pagesPerPart = Number(value);
      if (
        !/^\d+$/.test(value) ||
        pagesPerPart < 1 ||
        pagesPerPart >= totalPages ||
        Math.ceil(totalPages / pagesPerPart) > 100
      ) {
        throw new Error('تعداد صفحات هر بخش باید برای ساخت ۲ تا ۱۰۰ فایل کافی باشد.');
      }
      const parts = await getWorker().split(buffer, pagesPerPart, (completed) => {
        if (splitOperation.current === operation) {
          setProgress(completed);
        }
      });
      if (splitOperation.current !== operation) {
        return;
      }
      const JSZip = await loadJsZip();
      if (splitOperation.current !== operation) {
        return;
      }
      const zip = new JSZip();
      parts.forEach((part, index) => zip.file(`part-${index + 1}.pdf`, part));
      const blob = await zip.generateAsync({ type: 'blob' });

      if (splitOperation.current === operation) {
        setDownloadUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      if (splitOperation.current === operation) {
        setError(message);
      }
    } finally {
      if (splitOperation.current === operation) {
        splitOperation.current = null;
        setBusy(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">تقسیم فایل PDF آنلاین</h1>
          <p className="text-lg text-(--text-secondary)">
            فایل را به بخش‌های پشت سر هم تقسیم و همهٔ PDFها را در یک فایل ZIP دانلود کنید.
          </p>
          <p className="mt-2 text-sm text-(--text-muted)">
            برای انتخاب صفحه‌های ناپیوسته، از{' '}
            <Link className="underline" href="/pdf-tools/extract/extract-pages">
              ابزار استخراج صفحات PDF
            </Link>{' '}
            استفاده کنید.
          </p>
        </div>

        <Card className="p-6 space-y-4" aria-busy={busy}>
          <div className="flex flex-col gap-3">
            <label htmlFor="split-pdf-file" className="text-sm font-semibold text-(--text-primary)">
              فایل PDF خود را اینجا بکشید یا انتخاب کنید
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
                id="split-pdf-file"
                type="file"
                aria-label="انتخاب فایل PDF"
                accept="application/pdf"
                disabled={busy}
                onChange={(event) => {
                  void onSelectFile(event.currentTarget.files);
                  event.currentTarget.value = '';
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'split-pdf-error' : undefined}
              />
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-sm font-semibold text-(--text-primary)">
                  فایل PDF را اینجا بکشید
                </div>
                <div className="text-xs text-(--text-muted)">یا کلیک کنید تا فایل انتخاب کنید</div>
              </div>
            </div>
          </div>

          {file ? (
            <div className="rounded-md border border-(--border-light) bg-(--surface-1) px-4 py-3 text-sm text-(--text-secondary)">
              {file.name} | تعداد صفحات: {totalPages ?? '-'}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <label
              htmlFor="split-pdf-pages"
              className="text-sm font-semibold text-(--text-primary)"
            >
              تعداد صفحات هر بخش
            </label>
            <input
              id="split-pdf-pages"
              type="text"
              value={pagesInput}
              onChange={(e) => {
                setPagesInput(e.target.value);
                setDownloadUrl(null);
              }}
              placeholder="مثال: ۲"
              inputMode="numeric"
              disabled={busy}
              className="input-field"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'split-pdf-pages-help split-pdf-error' : 'split-pdf-pages-help'
              }
            />
            <div id="split-pdf-pages-help" className="text-xs text-(--text-muted)">
              برای مثال، یک PDF پنج‌صفحه‌ای با دو صفحه در هر بخش به سه فایل تقسیم می‌شود. پیوست‌های
              سند اصلی در بخش‌ها منتقل نمی‌شوند.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                selectionId.current += 1;
                setFile(null);
                setTotalPages(null);
                setDownloadUrl(null);
              }}
              disabled={busy || !file}
            >
              تغییر فایل
            </Button>
            <Button type="button" onClick={onSplit} disabled={busy}>
              {busy ? 'در حال تقسیم...' : 'تقسیم صفحات'}
            </Button>
            {busy ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  splitOperation.current = null;
                  workerRef.current?.cancel();
                  restoreSplitFocus.current = true;
                  setBusy(false);
                }}
              >
                لغو تقسیم
              </Button>
            ) : null}
          </div>

          {busy ? (
            <div role="status" className="text-sm text-(--text-muted)">
              {progress === 1
                ? 'در حال ساخت ZIP'
                : `پیشرفت پردازش صفحات: ${Math.floor(progress * 100).toLocaleString('fa-IR')}٪`}
            </div>
          ) : null}

          {error ? (
            <Alert id="split-pdf-error" variant="danger">
              {error}
            </Alert>
          ) : null}

          {downloadUrl ? (
            <Alert variant="success">
              فایل آماده است.{' '}
              <a
                className="font-semibold underline"
                href={downloadUrl}
                download="split.zip"
                onClick={() =>
                  void recordHistory({
                    tool: 'pdf-split',
                    inputSummary: `صفحات در هر بخش: ${pagesInput}`,
                    outputSummary: 'دانلود فایل تقسیم‌شده',
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
