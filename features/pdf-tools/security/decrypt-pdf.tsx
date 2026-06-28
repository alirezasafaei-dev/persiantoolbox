'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { loadPdfJs, loadPdfLib } from '@/features/pdf-tools/lazy-deps';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import { formatBytesFa } from '@/shared/utils/format';

async function renderPageToPng(page: PDFPageProxy, scale: number) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    throw new Error('مرورگر از پردازش تصویر پشتیبانی نمی کند.');
  }

  await page.render({ canvasContext: context, viewport }).promise;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (!blob) {
    throw new Error('تبدیل صفحه ناموفق بود.');
  }
  return new Uint8Array(await blob.arrayBuffer());
}

export default function DecryptPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const ensurePdfWorker = async () => {
    const { GlobalWorkerOptions } = await loadPdfJs();
    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const originalSize = useMemo(() => file?.size ?? 0, [file]);

  const onSelectFile = (fileList: FileList | null) => {
    setError(null);
    setDownloadUrl(null);
    setResultSize(null);

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

  const onDecrypt = async () => {
    setError(null);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }

    setBusy(true);
    try {
      await ensurePdfWorker();
      const { getDocument, PasswordResponses } = await loadPdfJs();
      const { PDFDocument } = await loadPdfLib();
      const buffer = await file.arrayBuffer();
      const pdfTask = getDocument({
        data: new Uint8Array(buffer),
        password: password || undefined,
      });

      pdfTask.onPassword = (callback: (password: string) => void, reason: number) => {
        if (reason === PasswordResponses.NEED_PASSWORD) {
          callback(password || '');
        } else if (reason === PasswordResponses.INCORRECT_PASSWORD) {
          callback(password || '');
        }
      };

      const pdf = await pdfTask.promise;
      const output = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const pngBytes = await renderPageToPng(page, 2);
        const image = await output.embedPng(pngBytes);
        const { width, height } = image.scale(1);
        const newPage = output.addPage([width, height]);
        newPage.drawImage(image, { x: 0, y: 0, width, height });
      }

      const bytes = await output.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });

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

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">حذف رمز PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            بازسازی PDF بدون رمز (صفحات به صورت تصویر ذخیره می شوند)
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="decrypt-pdf-file"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              فایل PDF رمزدار را اینجا بکشید یا انتخاب کنید
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
                onSelectFile(e.dataTransfer.files);
              }}
            >
              <input
                id="decrypt-pdf-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => onSelectFile(e.target.files)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">🔓</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  فایل PDF رمزدار را اینجا بکشید
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  یا کلیک کنید تا فایل انتخاب کنید
                </div>
              </div>
            </div>
          </div>

          {file && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {file.name} | حجم اولیه: {formatBytesFa(originalSize)}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="decrypt-pdf-password"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              رمز عبور
            </label>
            <input
              id="decrypt-pdf-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز فایل را وارد کنید"
              className="input-field"
            />
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
            <Button type="button" onClick={onDecrypt} disabled={busy}>
              {busy ? 'در حال پردازش...' : 'حذف رمز'}
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {downloadUrl && resultSize !== null && (
            <Alert variant="success" className="space-y-2">
              <div>حجم خروجی: {formatBytesFa(resultSize)}</div>
              <div>
                <a
                  className="font-semibold underline"
                  href={downloadUrl}
                  download="decrypted.pdf"
                  onClick={() =>
                    void recordHistory({
                      tool: 'pdf-decrypt',
                      inputSummary: `فایل: ${file?.name ?? ''}`,
                      outputSummary: `دانلود فایل با حجم ${formatBytesFa(resultSize)}`,
                    })
                  }
                >
                  دانلود فایل
                </a>
              </div>
              <div className="text-xs text-[rgb(var(--color-success-rgb)/0.8)]">
                خروجی به صورت صفحات تصویری ذخیره می شود و قابل جستجو نیست.
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
