'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Button, Card, ProgressBar } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import { formatBytesFa } from '@/shared/utils/format';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from '@/shared/analytics/events';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type SelectedFile = {
  file: File;
  id: string;
  downloadName: string;
  result?: { url: string; size: number };
};

export default function CompressPdfPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<PdfWorkerClient | null>(null);
  const downloadUrls = useRef(new Map<string, string>());
  const nextFileId = useRef(0);

  useEffect(() => {
    const urls = downloadUrls.current;

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const getWorker = () => {
    if (!workerRef.current) {
      workerRef.current = createPdfWorkerClient();
    }
    return workerRef.current;
  };

  const releaseDownload = (id: string) => {
    const url = downloadUrls.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      downloadUrls.current.delete(id);
    }
  };

  const totalSize = useMemo(() => files.reduce((sum, item) => sum + item.file.size, 0), [files]);

  const onSelectFiles = (fileList: FileList | null) => {
    if (busy || !fileList?.length) {
      return;
    }

    setError(null);
    const usedNames = new Set(files.map((item) => item.downloadName.toLowerCase()));
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
      const stem = file.name.replace(/\.pdf$/i, '');
      let downloadName = `${stem}_compressed.pdf`;
      let suffix = 2;
      while (usedNames.has(downloadName.toLowerCase())) {
        downloadName = `${stem}_compressed-${suffix}.pdf`;
        suffix += 1;
      }
      usedNames.add(downloadName.toLowerCase());
      next.push({ file, id: String(nextFileId.current++), downloadName });
    });

    if (errors.length > 0) {
      setError(errors.slice(0, 3).join(' | '));
    }

    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    releaseDownload(id);
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

    try {
      const worker = getWorker();
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const item = files[i];
        if (!item) {
          continue;
        }
        const buffer = await item.file.arrayBuffer();
        if (workerRef.current !== worker) {
          return;
        }
        const result = await worker.request({ type: 'compress', file: buffer }, (value) => {
          const fileProgress = (i + value) / total;
          setProgress(Math.round(fileProgress * 100));
        });

        if (workerRef.current !== worker) {
          return;
        }
        const blob = new Blob([result.buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        releaseDownload(item.id);
        downloadUrls.current.set(item.id, url);
        setFiles((prev) =>
          prev.map((file) =>
            file.id === item.id ? { ...file, result: { url, size: blob.size } } : file,
          ),
        );
      }

      trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_COMPLETE, {
        tool_id: 'compress-pdf',
        category: 'pdf',
        file_count: total,
      });
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

  const completed = files.filter((file) => file.result);
  const totalOriginal = completed.reduce((sum, file) => sum + file.file.size, 0);
  const totalCompressed = completed.reduce((sum, file) => sum + (file.result?.size ?? 0), 0);
  const savedPercent =
    totalOriginal > 0 && totalCompressed > 0
      ? Math.max(0, ((totalOriginal - totalCompressed) / totalOriginal) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">فشرده سازی PDF</h1>
          <p className="text-lg text-(--text-secondary)">
            کاهش حجم فایل PDF — پشتیبانی از چند فایل هم‌زمان
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="compress-pdf-files"
              className="text-sm font-semibold text-(--text-primary)"
            >
              فایل PDF خود را اینجا بکشید یا انتخاب کنید
            </label>
            <div
              className="relative rounded-md border-2 border-dashed border-(--border-medium) bg-(--surface-2) p-8 text-center transition-colors hover:border-primary hover:bg-[rgb(var(--color-primary-rgb)/0.05)]"
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
                onSelectFiles(e.dataTransfer.files);
              }}
            >
              <input
                id="compress-pdf-files"
                type="file"
                aria-label="انتخاب فایل PDF"
                accept="application/pdf"
                multiple
                disabled={busy}
                onChange={(event) => {
                  onSelectFiles(event.currentTarget.files);
                  event.currentTarget.value = '';
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-sm font-semibold text-(--text-primary)">
                  فایل PDF را اینجا بکشید
                </div>
                <div className="text-xs text-(--text-muted)">یا کلیک کنید تا فایل انتخاب کنید</div>
              </div>
            </div>
            <div className="text-xs text-(--text-muted)">
              می‌توانید چند فایل PDF را هم‌زمان انتخاب و فشرده کنید.
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-(--border-light) bg-(--surface-1) px-4 py-3"
                >
                  <div className="text-sm text-(--text-primary)">
                    {index + 1}. {item.file.name}{' '}
                    <span className="text-xs text-(--text-muted)">
                      ({formatBytesFa(item.file.size)}
                      {item.result
                        ? ` → ${formatBytesFa(item.result.size)} (${Math.max(0, ((item.file.size - item.result.size) / item.file.size) * 100).toFixed(1)}% ↓)`
                        : ''}
                      )
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      disabled={busy}
                      className="text-sm text-danger hover:brightness-90"
                    >
                      حذف
                    </button>
                    {item.result ? (
                      <a
                        href={item.result.url}
                        download={item.downloadName}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        دانلود
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs text-(--text-muted) pt-2">
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
                files.forEach((file) => releaseDownload(file.id));
                setFiles([]);
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
