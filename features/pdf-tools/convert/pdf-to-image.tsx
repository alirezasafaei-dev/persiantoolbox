'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { parsePageRanges } from '@/features/pdf-tools/utils/pageRanges';
import {
  loadJsZip,
  loadPdfJs,
  pdfJsDocumentOptions,
  setupPdfWorker,
} from '@/features/pdf-tools/lazy-deps';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import { formatBytesFa } from '@/shared/utils/format';

type OutputImage = {
  page: number;
  format: OutputFormat;
  url: string;
  size: number;
  blob: Blob;
  width: number;
  height: number;
};

type OutputFormat = 'png' | 'jpeg';

type ScaleOption = 1 | 1.5 | 2;

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_SELECTION = 50;
const MAX_CANVAS_SIDE = 8_192;
// At four bytes per pixel, limit a render to 32 MB of canvas data and
// retained previews to 96 MB of decoded pixel data per batch.
const MAX_PAGE_PIXELS = 8_000_000;
const MAX_BATCH_PIXELS = 24_000_000;
const MAX_IMAGE_BYTES = 48 * 1024 * 1024;
const CONVERT_TIMEOUT_MS = 120_000;

function parseImagePages(input: string, totalPages: number) {
  const selection = input.trim().toLowerCase();
  if ((!selection || selection === 'all') && totalPages > MAX_SELECTION) {
    throw new Error('حداکثر ۵۰ صفحه را در هر نوبت انتخاب کنید.');
  }
  return !selection || selection === 'all'
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : parsePageRanges(selection, totalPages, MAX_SELECTION).map((index) => index + 1);
}

async function withPdf<T>(
  file: File,
  signal: AbortSignal,
  operation: (pdf: PDFDocumentProxy) => Promise<T> | T,
): Promise<T> {
  await setupPdfWorker();
  const { getDocument } = await loadPdfJs();
  const data = await file.arrayBuffer();
  signal.throwIfAborted();
  const loading = getDocument({ data, ...pdfJsDocumentOptions });
  let destruction: Promise<void> | undefined;
  const cleanup = () => (destruction ??= loading.destroy().catch(() => {}));
  signal.addEventListener('abort', cleanup, { once: true });
  try {
    const pdf = await loading.promise;
    signal.throwIfAborted();
    return await operation(pdf);
  } finally {
    signal.removeEventListener('abort', cleanup);
    await cleanup();
  }
}

async function renderPageToImage(
  page: PDFPageProxy,
  format: OutputFormat,
  scale: ScaleOption,
  quality: number,
  remainingPixels: number,
  signal: AbortSignal,
): Promise<{ blob: Blob; width: number; height: number }> {
  const viewport = page.getViewport({ scale });
  const width = Math.ceil(viewport.width);
  const height = Math.ceil(viewport.height);
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    Math.min(width, height) < 1 ||
    Math.max(width, height) > MAX_CANVAS_SIDE ||
    width * height > MAX_PAGE_PIXELS
  ) {
    throw new Error('ابعاد صفحه برای ساخت تصویر بیش از حد مجاز است. مقیاس را کمتر کنید.');
  }
  if (width * height > remainingPixels) {
    throw new Error(
      'حجم تصاویر این نوبت بیش از حد مجاز است. صفحه‌های کمتر یا مقیاس کوچک‌تری انتخاب کنید.',
    );
  }

  signal.throwIfAborted();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  try {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('مرورگر از پردازش تصویر پشتیبانی نمی‌کند.');
    }
    const task = page.render({ canvasContext: context, viewport });
    const cancel = () => task.cancel();
    signal.addEventListener('abort', cancel, { once: true });
    try {
      await task.promise;
    } finally {
      signal.removeEventListener('abort', cancel);
    }
    signal.throwIfAborted();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, format === 'png' ? 'image/png' : 'image/jpeg', quality);
    });
    if (!blob) {
      throw new Error('تبدیل صفحه ناموفق بود.');
    }
    return { blob, width, height };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();
  }
}

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [pagesInput, setPagesInput] = useState('all');
  const [format, setFormat] = useState<OutputFormat>('png');
  const [scale, setScale] = useState<ScaleOption>(1.5);
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<OutputImage[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const active = useRef(false);
  const selection = useRef<AbortController | null>(null);
  const conversion = useRef<AbortController | null>(null);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      selection.current?.abort();
      conversion.current?.abort();
      selection.current = null;
      conversion.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      outputs.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [outputs]);

  useEffect(() => {
    return () => {
      if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
      }
    };
  }, [zipUrl]);

  const totalOutputSize = useMemo(
    () => outputs.reduce((sum, item) => sum + item.size, 0),
    [outputs],
  );

  const onSelectFile = async (fileList: FileList | null) => {
    if (busy || zipBusy) {
      return;
    }
    selection.current?.abort();
    setFile(null);
    setError(null);
    setOutputs([]);
    setTotalPages(null);
    setZipUrl(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const selected = fileList[0];
    if (!selected || (selected.type !== 'application/pdf' && !/\.pdf$/i.test(selected.name))) {
      setError('فقط فایل PDF قابل انتخاب است.');
      return;
    }
    if (!selected.size || selected.size > MAX_FILE_BYTES) {
      setError('یک فایل PDF غیرخالی و حداکثر ۵۰ مگابایتی انتخاب کنید.');
      return;
    }

    const loading = new AbortController();
    selection.current = loading;
    const timeout = setTimeout(() => {
      if (!loading.signal.aborted) {
        loading.abort();
        setError('زمان بررسی PDF به پایان رسید. دوباره تلاش کنید یا فایل کوچک‌تری انتخاب کنید.');
      }
    }, CONVERT_TIMEOUT_MS);
    try {
      const count = await withPdf(selected, loading.signal, (pdf) => pdf.numPages);
      if (!loading.signal.aborted) {
        setTotalPages(count);
        setFile(selected);
      }
    } catch {
      if (!loading.signal.aborted) {
        setError('خواندن فایل ممکن نشد. سالم بودن PDF و نداشتن رمز عبور را بررسی کنید.');
      }
    } finally {
      clearTimeout(timeout);
      if (selection.current === loading) {
        selection.current = null;
      }
    }
  };

  const cancelConversion = () => {
    conversion.current?.abort();
    conversion.current = null;
    setBusy(false);
  };

  const onConvert = async () => {
    if (conversion.current) {
      return;
    }
    setError(null);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }
    if (!totalPages) {
      setError('تعداد صفحات فایل مشخص نیست.');
      return;
    }

    const loading = new AbortController();
    conversion.current = loading;
    const { signal } = loading;
    const timeout = setTimeout(() => {
      if (conversion.current === loading) {
        cancelConversion();
        setError('زمان ساخت تصاویر به پایان رسید. صفحه‌های کمتر یا مقیاس کوچک‌تری انتخاب کنید.');
      }
    }, CONVERT_TIMEOUT_MS);
    setBusy(true);
    setProgress({ completed: 0, total: 0 });
    setOutputs([]);
    setZipUrl(null);
    const results: OutputImage[] = [];
    let keepResults = false;
    try {
      const pages = parseImagePages(pagesInput, totalPages);
      setProgress({ completed: 0, total: pages.length });
      await withPdf(file, signal, async (pdf) => {
        let remainingPixels = MAX_BATCH_PIXELS;
        let totalBytes = 0;
        for (const pageNumber of pages) {
          signal.throwIfAborted();
          const page = await pdf.getPage(pageNumber);
          const { blob, width, height } = await renderPageToImage(
            page,
            format,
            scale,
            quality,
            remainingPixels,
            signal,
          );
          signal.throwIfAborted();
          remainingPixels -= width * height;
          totalBytes += blob.size;
          if (totalBytes > MAX_IMAGE_BYTES) {
            throw new Error('حجم فایل‌های خروجی بیش از حد مجاز است. صفحه‌های کمتری انتخاب کنید.');
          }
          const url = URL.createObjectURL(blob);
          results.push({ page: pageNumber, format, url, size: blob.size, blob, width, height });
          setProgress({ completed: results.length, total: pages.length });
        }
      });
      signal.throwIfAborted();
      setOutputs(results);
      keepResults = true;
    } catch (e) {
      if (!signal.aborted) {
        setError(e instanceof Error ? e.message : 'خطایی در ساخت تصاویر رخ داد.');
      }
    } finally {
      clearTimeout(timeout);
      if (!keepResults) {
        results.forEach((item) => URL.revokeObjectURL(item.url));
      }
      if (conversion.current === loading) {
        conversion.current = null;
        setBusy(false);
      }
    }
  };

  const onDownloadAll = async () => {
    setError(null);
    if (outputs.length === 0) {
      setError('ابتدا خروجی ایجاد کنید.');
      return;
    }
    setZipBusy(true);
    try {
      const JSZip = await loadJsZip();
      const zip = new JSZip();
      outputs.forEach((item) => {
        zip.file(`page-${item.page}.${item.format}`, item.blob);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      if (active.current) {
        setZipUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
    } finally {
      setZipBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">تبدیل PDF به عکس</h1>
          <p className="text-lg text-(--text-secondary)">
            صفحات PDF را به تصویر PNG یا JPG تبدیل کنید
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="pdf-to-image-file"
              className="text-sm font-semibold text-(--text-primary)"
            >
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
                id="pdf-to-image-file"
                type="file"
                aria-label="انتخاب فایل PDF"
                accept="application/pdf"
                disabled={busy || zipBusy}
                onChange={(event) => {
                  void onSelectFile(event.currentTarget.files);
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
          </div>

          {file ? (
            <div className="rounded-md border border-(--border-light) bg-(--surface-1) px-4 py-3 text-sm text-(--text-secondary)">
              {file.name} | تعداد صفحات: {totalPages ?? '-'}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="pdf-to-image-pages"
                className="text-sm font-semibold text-(--text-primary)"
              >
                صفحات مورد نظر
              </label>
              <input
                id="pdf-to-image-pages"
                type="text"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                placeholder="all یا 1-3,5"
                className="input-field"
              />
              <div className="text-xs text-(--text-muted)">
                برای همه صفحات مقدار all را وارد کنید.
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pdf-to-image-format"
                  className="text-sm font-semibold text-(--text-primary)"
                >
                  فرمت خروجی
                </label>
                <select
                  id="pdf-to-image-format"
                  className="input-field"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as OutputFormat)}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPG</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pdf-to-image-scale"
                  className="text-sm font-semibold text-(--text-primary)"
                >
                  کیفیت
                </label>
                <select
                  id="pdf-to-image-scale"
                  className="input-field"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value) as ScaleOption)}
                >
                  <option value={1}>عادی</option>
                  <option value={1.5}>بالا</option>
                  <option value={2}>خیلی بالا</option>
                </select>
              </div>
            </div>
          </div>

          {format === 'jpeg' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="pdf-to-image-quality"
                className="text-sm font-semibold text-(--text-primary)"
              >
                فشرده سازی JPG
              </label>
              <input
                id="pdf-to-image-quality"
                type="range"
                min={0.5}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
              <div className="text-xs text-(--text-muted)">
                کیفیت: {(quality * 100).toFixed(0)}%
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                selection.current?.abort();
                setFile(null);
                setTotalPages(null);
                setOutputs([]);
                setZipUrl(null);
              }}
              disabled={busy || zipBusy || !file}
            >
              تغییر فایل
            </Button>
            <Button type="button" onClick={onConvert} disabled={busy || zipBusy}>
              {busy ? 'در حال تبدیل...' : 'تبدیل به تصویر'}
            </Button>
            {busy ? (
              <Button type="button" variant="secondary" onClick={cancelConversion}>
                لغو پردازش
              </Button>
            ) : null}
          </div>

          {busy && progress.total > 0 ? (
            <p role="status" className="text-sm text-(--text-secondary)">
              {progress.completed.toLocaleString('fa-IR')} از{' '}
              {progress.total.toLocaleString('fa-IR')} صفحه تبدیل شد.
            </p>
          ) : null}
          {error ? <Alert variant="danger">{error}</Alert> : null}
        </Card>

        {outputs.length > 0 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-(--text-secondary)">
              <div>تعداد خروجی: {outputs.length}</div>
              <div>حجم کل: {formatBytesFa(totalOutputSize)}</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onDownloadAll}
                disabled={zipBusy || busy}
              >
                {zipBusy ? 'در حال آماده سازی...' : 'دانلود همه (ZIP)'}
              </Button>
              {zipUrl ? (
                <a
                  className="text-sm font-semibold underline text-success"
                  href={zipUrl}
                  download={`pdf-pages-${Date.now()}.zip`}
                  onClick={() =>
                    void recordHistory({
                      tool: 'pdf-to-image',
                      inputSummary: `ZIP | تعداد صفحات: ${outputs.length}`,
                      outputSummary: 'دانلود فایل ZIP تصاویر',
                    })
                  }
                >
                  دانلود فایل ZIP
                </a>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {outputs.map((item) => (
                <div
                  key={item.url}
                  className="rounded-md border border-(--border-light) bg-(--surface-1) p-4 space-y-3"
                >
                  <div className="text-sm font-semibold text-(--text-primary)">
                    صفحه {item.page}
                  </div>
                  <Image
                    src={item.url}
                    alt={`page-${item.page}`}
                    width={Math.max(1, item.width)}
                    height={Math.max(1, item.height)}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                    className="w-full h-auto rounded-lg border"
                  />
                  <div className="flex items-center justify-between text-xs text-(--text-muted)">
                    <div>{formatBytesFa(item.size)}</div>
                    <a
                      className="font-semibold underline"
                      href={item.url}
                      download={`page-${item.page}.${item.format}`}
                      onClick={() =>
                        void recordHistory({
                          tool: 'pdf-to-image',
                          inputSummary: `صفحه ${item.page}`,
                          outputSummary: `دانلود تصویر صفحه ${item.page}`,
                        })
                      }
                    >
                      دانلود
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        <RecentHistoryCard
          title="آخرین عملیات PDF"
          toolPrefixes={['pdf-']}
          toolIds={['image-to-pdf']}
        />
      </div>
    </div>
  );
}
