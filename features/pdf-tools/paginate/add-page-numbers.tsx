'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { loadPdfLib } from '@/features/pdf-tools/lazy-deps';
import { Card, Button } from '@/components/ui';

type State = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';

export default function AddPageNumbersPage() {
  const [state, setState] = useState<State>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<
    'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center'
  >('bottom-center');
  const [fontSize, setFontSize] = useState(12);
  const fileRef = useRef<ArrayBuffer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('فقط فایل PDF مجاز است.');
      setState('error');
      return;
    }

    setState('loading');
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await loadPdfLib();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      fileRef.current = arrayBuffer;
      setFileName(file.name);
      setPageCount(pdfDoc.getPageCount());
      setState('ready');
    } catch {
      setError('خطا در خواندن فایل PDF.');
      setState('error');
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!fileRef.current) {
      return;
    }

    setState('processing');
    setError('');

    try {
      const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
      const pdfDoc = await PDFDocument.load(fileRef.current, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page) {
          continue;
        }

        const { width, height } = page.getSize();
        const text = `${i + 1} / ${pages.length}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x: number;
        let y: number;

        switch (position) {
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = 30;
            break;
          case 'bottom-right':
            x = width - textWidth - 30;
            y = 30;
            break;
          case 'bottom-left':
            x = 30;
            y = 30;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - 30 - textHeight;
            break;
          default:
            x = (width - textWidth) / 2;
            y = 30;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.pdf', '_numbered.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setState('done');
    } catch {
      setError('خطا در پردازش فایل.');
      setState('error');
    }
  }, [fileName, position, fontSize]);

  const handleReset = useCallback(() => {
    setState('idle');
    setFileName('');
    setError('');
    setPageCount(0);
    setPosition('bottom-center');
    setFontSize(12);
    fileRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          افزودن شماره صفحه به PDF
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">شماره صفحه را به فایل PDF اضافه کنید</p>
      </div>

      <Card className="p-6 space-y-4">
        {state === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              فایل PDF خود را برای افزودن شماره صفحه انتخاب کنید.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-[var(--text-inverted)] hover:file:opacity-90"
            />
          </div>
        )}

        {state === 'loading' && (
          <div className="text-center text-[var(--text-muted)] py-4">در حال بارگذاری فایل...</div>
        )}

        {(state === 'ready' || state === 'processing' || state === 'done') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">فایل:</span>
              <span className="font-medium text-[var(--text-primary)]">{fileName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">تعداد صفحات:</span>
              <span className="font-medium text-[var(--text-primary)]">{pageCount}</span>
            </div>

            <div className="border-t border-[var(--border-light)] pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  موقعیت شماره صفحه
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as typeof position)}
                  className="w-full px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm"
                >
                  <option value="bottom-center">پایین وسط</option>
                  <option value="bottom-right">پایین راست</option>
                  <option value="bottom-left">پایین چپ</option>
                  <option value="top-center">بالا وسط</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  اندازه فونت: {fontSize}
                </label>
                <input
                  type="range"
                  min={8}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleProcess} disabled={state === 'processing' || state === 'done'}>
                {state === 'processing'
                  ? 'در حال پردازش...'
                  : state === 'done'
                    ? 'دانلود شد'
                    : 'افزودن شماره صفحه'}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                فایل جدید
              </Button>
            </div>
          </div>
        )}

        {state === 'error' && error && (
          <div className="p-4 bg-[rgba(239,68,68,0.12)] rounded-[var(--radius-md)] text-[var(--color-danger)] text-sm">
            {error}
          </div>
        )}

        {state === 'done' && (
          <div className="p-4 bg-[rgba(16,185,129,0.12)] rounded-[var(--radius-md)] text-[var(--color-success)] text-sm">
            شماره صفحه با موفقیت اضافه شد و دانلود آغاز شد.
          </div>
        )}
      </Card>
    </div>
  );
}
