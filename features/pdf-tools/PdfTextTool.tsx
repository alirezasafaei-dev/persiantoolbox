'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { useToast } from '@/shared/ui/toast-context';
import { loadPdfJs, pdfJsDocumentOptions, setupPdfWorker } from './lazy-deps';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_PAGES = 500;
// Bound the text retained for display, clipboard and TXT generation.
const MAX_TEXT_LENGTH = 1_000_000;
const PROCESS_TIMEOUT_MS = 90_000;

class PdfTextError extends Error {}

type Props = {
  mode: 'extract' | 'convert';
};

export default function PdfTextTool({ mode }: Props) {
  const extract = mode === 'extract';
  const heading = extract ? 'استخراج متن PDF' : 'تبدیل PDF به متن';
  const action = extract ? 'استخراج متن' : 'تبدیل به متن';
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [result, setResult] = useState<{ text: string; url: string; filename: string } | null>(
    null,
  );
  const currentOperation = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      currentOperation.current?.abort();
      currentOperation.current = null;
    },
    [],
  );
  useEffect(() => {
    return () => {
      if (result) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  const reset = useCallback(() => {
    currentOperation.current?.abort();
    currentOperation.current = null;
    setFile(null);
    setBusy(false);
    setError(null);
    setResult(null);
  }, []);

  function chooseFile(candidate: File | undefined) {
    if (!candidate || file) {
      return;
    }
    setError(null);
    if (candidate.type !== 'application/pdf' && !/\.pdf$/i.test(candidate.name)) {
      setError('فقط فایل PDF قابل انتخاب است.');
      return;
    }
    if (!candidate.size || candidate.size > MAX_FILE_BYTES) {
      setError('یک فایل PDF غیرخالی و حداکثر ۵۰ مگابایتی انتخاب کنید.');
      return;
    }
    setFile(candidate);
  }

  async function process() {
    if (!file || currentOperation.current) {
      return;
    }
    const controller = new AbortController();
    currentOperation.current = controller;
    const { signal } = controller;
    let loading: PDFDocumentLoadingTask | undefined;
    const timeout = setTimeout(() => {
      controller.abort();
      currentOperation.current = null;
      setBusy(false);
      setError('زمان استخراج متن به پایان رسید. دوباره تلاش کنید یا فایل کوچک‌تری انتخاب کنید.');
    }, PROCESS_TIMEOUT_MS);
    const dispose = () => {
      clearTimeout(timeout);
      void loading?.destroy().catch(() => {});
    };
    signal.addEventListener('abort', dispose, { once: true });

    setBusy(true);
    setError(null);
    setProgress({ completed: 0, total: 0 });
    try {
      const [{ getDocument }, data] = await Promise.all([
        loadPdfJs(),
        file.arrayBuffer(),
        setupPdfWorker(),
      ]);
      signal.throwIfAborted();
      loading = getDocument({ data, ...pdfJsDocumentOptions });
      const pdf = await loading.promise;
      signal.throwIfAborted();
      if (pdf.numPages > MAX_PAGES) {
        throw new PdfTextError('یک فایل PDF با حداکثر ۵۰۰ صفحه انتخاب کنید.');
      }

      setProgress({ completed: 0, total: pdf.numPages });
      const pages: string[] = [];
      let textLength = 0;
      for (let number = 1; number <= pdf.numPages; number++) {
        signal.throwIfAborted();
        const page = await pdf.getPage(number);
        const reader = page.streamTextContent().getReader();
        let line: string[] = [];
        const lines: string[] = [];
        let previousY: number | null = null;

        const nextLine = () => {
          if (line.length > 0) {
            lines.push(line.join(' '));
            line = [];
          }
        };
        try {
          for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
            signal.throwIfAborted();
            for (const item of chunk.value.items) {
              if (!('str' in item)) {
                continue;
              }
              const currentY = item.transform[5];
              if (previousY !== null && Math.abs(currentY - previousY) > 5) {
                nextLine();
              }
              const text = item.str.trim();
              if (text) {
                line.push(text);
                textLength += text.length + 1;
                if (textLength > MAX_TEXT_LENGTH) {
                  throw new PdfTextError(
                    'متن از ظرفیت یک خروجی بیشتر است. فایل را به چند بخش تقسیم کنید.',
                  );
                }
                previousY = currentY;
              }
              if (item.hasEOL) {
                nextLine();
              }
            }
          }
        } finally {
          void reader.cancel().catch(() => {});
          reader.releaseLock();
          page.cleanup();
        }
        signal.throwIfAborted();
        nextLine();
        if (lines.length > 0) {
          const text = lines.join('\n');
          pages.push(extract ? `--- صفحه ${number} ---\n${text}` : text);
        }
        setProgress({ completed: number, total: pdf.numPages });
      }

      if (pages.length === 0) {
        throw new PdfTextError('متن قابل انتخاب پیدا نشد. برای PDF اسکن‌شده از OCR استفاده کنید.');
      }
      signal.throwIfAborted();
      const text = pages.join('\n\n');
      const suffix = extract ? '_text.txt' : '.txt';
      setResult({
        text,
        url: URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })),
        filename: `${file.name.replace(/\.pdf$/i, '')}${suffix}`,
      });
    } catch (cause) {
      if (!signal.aborted) {
        setError(
          cause instanceof PdfTextError
            ? cause.message
            : 'خواندن PDF ممکن نشد. سالم بودن فایل و نداشتن رمز عبور را بررسی کنید.',
        );
      }
    } finally {
      signal.removeEventListener('abort', dispose);
      if (!signal.aborted) {
        dispose();
      }
      if (currentOperation.current === controller) {
        currentOperation.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-(--text-primary)">{heading}</h1>
        <p className="text-lg text-(--text-secondary)">
          {extract
            ? 'متن قابل انتخاب را با نشانگر صفحه‌ها کپی یا دانلود کنید.'
            : 'متن قابل انتخاب را به‌صورت فایل سادهٔ TXT دانلود کنید.'}
        </p>
      </div>
      <Card className="space-y-4 p-6">
        {!file && (
          <label
            className="block space-y-3 rounded-md border-2 border-dashed border-(--border-medium) p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseFile(event.dataTransfer.files[0]);
            }}
          >
            <span className="block text-sm font-medium">
              فایل PDF را انتخاب کنید یا اینجا بکشید.
            </span>
            <input
              aria-label="انتخاب فایل"
              className="block w-full min-w-0 text-sm text-(--text-muted) file:ms-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-(--text-inverted)"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                chooseFile(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
          </label>
        )}
        <p className="text-sm leading-7 text-(--text-muted)">
          برای خواندن صفحات اسکن‌شده،{' '}
          <Link href="/tools/persian-ocr" className="font-medium text-primary underline">
            ابزار OCR فارسی
          </Link>{' '}
          را باز کنید.
        </p>
        {file ? (
          <p className="wrap-anywhere text-sm text-(--text-secondary)">
            <bdi>{file.name}</bdi>
          </p>
        ) : null}
        {file ? (
          <div className="flex flex-wrap gap-3">
            {!result && (
              <Button onClick={process} disabled={busy}>
                {busy ? 'در حال خواندن…' : action}
              </Button>
            )}
            <Button variant="secondary" onClick={reset}>
              {busy ? 'لغو پردازش' : 'فایل جدید'}
            </Button>
          </div>
        ) : null}
        {busy && progress.total > 0 ? (
          <p role="status" className="text-sm text-(--text-secondary)">
            {progress.completed.toLocaleString('fa-IR')} از {progress.total.toLocaleString('fa-IR')}{' '}
            صفحه خوانده شد.
          </p>
        ) : null}
        {error ? <Alert variant="danger">{error}</Alert> : null}
        {result ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.text);
                    showToast('کپی شد');
                  } catch {
                    showToast('کپی متن ممکن نشد.', 'error');
                  }
                }}
              >
                کپی
              </Button>
              <a
                className="font-semibold text-primary underline"
                href={result.url}
                download={result.filename}
              >
                دانلود TXT
              </a>
            </div>
            <textarea
              aria-label="متن استخراج‌شده"
              readOnly
              dir="auto"
              value={result.text}
              className="h-72 w-full resize-y rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-sm text-(--text-primary)"
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
