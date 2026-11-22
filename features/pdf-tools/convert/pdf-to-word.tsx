'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import { Card, Button } from '@/components/ui';
import { loadPdfJs, setupPdfWorker } from '@/features/pdf-tools/lazy-deps';

type State = 'idle' | 'ready' | 'processing' | 'done';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_PAGES = 500;
// DOCX packing keeps the entire document tree and XML in memory before writing the ZIP.
const MAX_TEXT_LENGTH = 1_000_000;
const MAX_TEXT_RUNS = 50_000;
const PROCESS_TIMEOUT_MS = 90_000;
const TOO_MUCH_TEXT = 'متن از ظرفیت یک خروجی Word بیشتر است. فایل را به چند بخش تقسیم کنید.';

class ConversionError extends Error {}

export default function PdfToWordPage() {
  const [state, setState] = useState<State>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [processedPages, setProcessedPages] = useState(0);
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<File | null>(null);
  const operationRef = useRef<AbortController | null>(null);
  const outputUrlRef = useRef<string | null>(null);

  const clearDownload = useCallback(() => {
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      operationRef.current?.abort();
      clearDownload();
    },
    [clearDownload],
  );

  const handleFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setError('فایل PDF انتخاب کنید.');
      event.target.value = '';
      return;
    }
    if (!file.size || file.size > MAX_FILE_BYTES) {
      setError('یک فایل PDF غیرخالی و حداکثر ۵۰ مگابایتی انتخاب کنید.');
      event.target.value = '';
      return;
    }

    fileRef.current = file;
    setFileName(file.name);
    setError('');
    setState('ready');
  }, []);

  const handleProcess = useCallback(async () => {
    const source = fileRef.current;
    if (!source || operationRef.current) {
      return;
    }

    const operation = new AbortController();
    operationRef.current = operation;
    const { signal } = operation;
    let task: PDFDocumentLoadingTask | undefined;
    const timeout = setTimeout(() => {
      operation.abort();
      operationRef.current = null;
      setError('زمان پردازش به پایان رسید. دوباره تلاش کنید یا فایل کوچک‌تری انتخاب کنید.');
      setState('ready');
    }, PROCESS_TIMEOUT_MS);
    const dispose = () => {
      clearTimeout(timeout);
      void task?.destroy().catch(() => {});
    };
    signal.addEventListener('abort', dispose, { once: true });

    setState('processing');
    setError('');
    setPageCount(0);
    setProcessedPages(0);

    try {
      const [pdfjsLib, { Document, Packer, Paragraph, TextRun }] = await Promise.all([
        loadPdfJs(),
        import('docx'),
        setupPdfWorker(),
      ]);
      const arrayBuffer = await source.arrayBuffer();
      signal.throwIfAborted();
      task = pdfjsLib.getDocument({
        data: arrayBuffer,
        isEvalSupported: false,
        stopAtErrors: true,
      });
      const pdf = await task.promise;
      signal.throwIfAborted();
      const totalPages = pdf.numPages;
      if (totalPages > MAX_PAGES) {
        throw new ConversionError('برای ساخت فایل Word، یک PDF با حداکثر ۵۰۰ صفحه انتخاب کنید.');
      }
      setPageCount(totalPages);

      const paragraphs: InstanceType<typeof Paragraph>[] = [];
      let textLength = 0;
      let textRuns = 0;
      for (let number = 1; number <= totalPages; number++) {
        const page = await pdf.getPage(number);
        const content = await page.getTextContent();
        page.cleanup();
        signal.throwIfAborted();

        let lastY: number | null = null;
        const line: { text: string; rtl: boolean }[] = [];
        const addLine = () => {
          const first = line[0];
          if (first) {
            paragraphs.push(
              new Paragraph({
                bidirectional: first.rtl,
                children: line.map(
                  ({ text, rtl }, index) =>
                    new TextRun({
                      text: index > 0 ? ` ${text}` : text,
                      rightToLeft: rtl,
                      size: 24,
                    }),
                ),
              }),
            );
            line.length = 0;
          }
        };

        for (const item of content.items) {
          if (!('str' in item)) {
            continue;
          }
          const y = item.transform[5];
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            addLine();
          }
          const text = item.str.trim();
          if (text) {
            textLength += text.length;
            textRuns += 1;
            if (textLength > MAX_TEXT_LENGTH || textRuns > MAX_TEXT_RUNS) {
              throw new ConversionError(TOO_MUCH_TEXT);
            }
            line.push({ text, rtl: item.dir === 'rtl' });
            lastY = y;
          }
          if (item.hasEOL) {
            addLine();
          }
        }
        addLine();
        setProcessedPages(number);
      }

      if (paragraphs.length === 0) {
        throw new ConversionError(
          'متن قابل انتخاب در فایل پیدا نشد. برای صفحات اسکن‌شده از OCR استفاده کنید.',
        );
      }

      const doc = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      signal.throwIfAborted();
      clearDownload();
      const url = URL.createObjectURL(blob);
      outputUrlRef.current = url;
      const name = `${source.name.replace(/\.pdf$/i, '')}.docx`;
      setDownload({ url, name });

      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setState('done');
    } catch (cause) {
      if (!signal.aborted) {
        setError(
          cause instanceof ConversionError
            ? cause.message
            : 'خواندن PDF یا ساخت Word ممکن نشد. سالم بودن فایل و نداشتن رمز عبور را بررسی کنید.',
        );
        setState('ready');
      }
    } finally {
      signal.removeEventListener('abort', dispose);
      if (!signal.aborted) {
        dispose();
      }
      if (operationRef.current === operation) {
        operationRef.current = null;
      }
    }
  }, [clearDownload]);

  const handleReset = useCallback(() => {
    operationRef.current?.abort();
    operationRef.current = null;
    clearDownload();
    fileRef.current = null;
    setState('idle');
    setFileName('');
    setError('');
    setPageCount(0);
    setProcessedPages(0);
    setDownload(null);
  }, [clearDownload]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-(--text-primary)">تبدیل PDF به Word</h1>
        <p className="text-lg text-(--text-secondary)">
          متن قابل انتخاب PDF را در سند Word ذخیره کنید.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        {state === 'idle' && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-(--text-muted)">
              خروجی DOCX متن قابل ویرایش دارد. چیدمان اصلی، جدول‌ها و تصاویر منتقل نمی‌شوند. برای
              PDF اسکن‌شده از{' '}
              <Link className="font-medium text-primary underline" href="/tools/persian-ocr">
                OCR فارسی
              </Link>{' '}
              استفاده کنید.
            </p>
            <input
              type="file"
              aria-label="انتخاب فایل PDF"
              accept=".pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-(--text-muted) file:ms-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:font-semibold file:bg-primary file:text-(--text-inverted) hover:file:opacity-90"
            />
          </div>
        )}

        {(state === 'ready' || state === 'processing') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-(--text-secondary)">فایل:</span>
              <bdi className="min-w-0 break-all font-medium text-(--text-primary)">{fileName}</bdi>
            </div>

            {state === 'processing' && pageCount > 0 && (
              <p role="status" className="text-sm text-(--text-muted)">
                {processedPages.toLocaleString('fa-IR')} از {pageCount.toLocaleString('fa-IR')} صفحه
                خوانده شد.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleProcess} disabled={state === 'processing'}>
                {state === 'processing' ? 'در حال تبدیل...' : 'تبدیل به Word'}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                {state === 'processing' ? 'لغو پردازش' : 'فایل جدید'}
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <p role="alert" className="rounded-md bg-[rgba(239,68,68,0.12)] p-4 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {state === 'done' && download ? (
          <div className="space-y-2 rounded-md bg-[rgba(34,197,94,0.12)] p-4 text-sm text-success">
            <p role="status">فایل Word آماده شد.</p>
            <p className="text-(--text-muted)">
              صفحه‌های بررسی‌شده: {pageCount.toLocaleString('fa-IR')}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href={download.url} download={download.name} className="font-semibold underline">
                دانلود فایل Word
              </a>
              <Button variant="secondary" onClick={handleReset}>
                تبدیل فایل دیگر
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
