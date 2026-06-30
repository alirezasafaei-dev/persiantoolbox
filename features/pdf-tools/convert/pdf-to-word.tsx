'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { Card, Button } from '@/components/ui';

type State = 'idle' | 'ready' | 'processing' | 'done' | 'error';

export default function PdfToWordPage() {
  const [state, setState] = useState<State>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('فقط فایل PDF مجاز است.');
      setState('error');
      return;
    }

    fileRef.current = file;
    setFileName(file.name);
    setPageCount(0);
    setState('ready');
    setError('');
  }, []);

  const handleProcess = useCallback(async () => {
    if (!fileRef.current) {
      return;
    }

    setState('processing');
    setError('');

    try {
      const [pdfjsLib, docxMod] = await Promise.all([import('pdfjs-dist'), import('docx')]);

      const { Document, Packer, Paragraph, TextRun } = docxMod;

      const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).href;
      const workerResponse = await fetch(workerUrl);
      const workerBlob = await workerResponse.blob();
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);

      const arrayBuffer = await fileRef.current.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const paragraphs: InstanceType<typeof Paragraph>[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        let lastY: number | null = null;
        const lineTexts: string[] = [];

        for (const item of content.items) {
          if (!('str' in item)) {
            continue;
          }
          const str = (item as { str: string }).str;
          if (!str.trim()) {
            continue;
          }

          const y = (item as { transform: number[] })?.transform?.[5] ?? null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
            if (lineTexts.length > 0) {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: lineTexts.join(' '),
                      size: 24,
                    }),
                  ],
                }),
              );
              lineTexts.length = 0;
            }
          }
          lineTexts.push(str);
          lastY = y;
        }

        if (lineTexts.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: lineTexts.join(' '),
                  size: 24,
                }),
              ],
            }),
          );
        }

        if (i < totalPages) {
          paragraphs.push(new Paragraph({ children: [] }));
        }
      }

      if (paragraphs.length === 0) {
        throw new Error('متنی در فایل PDF یافت نشد.');
      }

      const doc = new Document({
        sections: [
          {
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace(/\.pdf$/i, '.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setPageCount(totalPages);
      setState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطا در تبدیل فایل.';
      setError(msg.includes('متنی') ? msg : 'خطا در تبدیل فایل. ممکن است فایل رمزگذاری شده باشد.');
      setState('error');
    }
  }, [fileName]);

  const handleReset = useCallback(() => {
    setState('idle');
    setFileName('');
    setError('');
    setPageCount(0);
    fileRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">تبدیل PDF به Word</h1>
        <p className="text-lg text-[var(--text-secondary)]">فایل PDF را به سند Word تبدیل کنید</p>
      </div>

      <Card className="p-6 space-y-4">
        {state === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              فایل PDF خود را برای تبدیل به Word انتخاب کنید. متن استخراج شده با حفظ ساختار پاراگراف
              در فایل .docx ذخیره می‌شود.
            </p>
            <input
              ref={inputRef}
              type="file"
              aria-label="انتخاب فایل PDF"
              accept=".pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-[var(--text-muted)] file:ms-4 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-[var(--text-inverted)] hover:file:opacity-90"
            />
          </div>
        )}

        {(state === 'ready' || state === 'processing') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">فایل:</span>
              <span className="font-medium text-[var(--text-primary)]">{fileName}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleProcess} disabled={state === 'processing'}>
                {state === 'processing' ? 'در حال تبدیل...' : 'تبدیل به Word'}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                فایل جدید
              </Button>
            </div>
          </div>
        )}

        {state === 'error' && error ? (
          <div className="p-4 bg-[rgba(239,68,68,0.12)] rounded-[var(--radius-md)] text-[var(--color-danger)] text-sm">
            {error}
          </div>
        ) : null}

        {state === 'done' && (
          <div className="p-4 bg-[rgba(34,197,94,0.12)] rounded-[var(--radius-md)] text-[var(--color-success)] text-sm space-y-2">
            <p>فایل Word با موفقیت دانلود شد.</p>
            <p className="text-[var(--text-muted)]">
              تعداد صفحات: {pageCount.toLocaleString('fa-IR')}
            </p>
            <Button variant="secondary" onClick={handleReset} className="mt-2">
              تبدیل فایل دیگر
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
