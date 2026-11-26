'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
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
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    return () => {
      if (download) {
        URL.revokeObjectURL(download.url);
      }
    };
  }, [download]);

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setError('فقط فایل PDF مجاز است.');
      setState('error');
      return;
    }
    if (!file.size || file.size > 50 * 1024 * 1024) {
      setError('یک فایل PDF غیرخالی و حداکثر ۵۰ مگابایتی انتخاب کنید.');
      setState('error');
      return;
    }

    setState('loading');
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await loadPdfLib();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
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
      const {
        PDFDocument,
        StandardFonts,
        PDFDict,
        PDFName,
        PDFOperator,
        PDFOperatorNames,
        degrees,
        endMarkedContent,
        rgb,
      } = await loadPdfLib();
      const pdfDoc = await PDFDocument.load(fileRef.current, { updateMetadata: false });
      const hasSignature = pdfDoc.context
        .enumerateIndirectObjects()
        .some(
          ([, object]) =>
            object instanceof PDFDict &&
            (object.get(PDFName.of('FT')) === PDFName.of('Sig') ||
              object.has(PDFName.of('ByteRange'))),
        );
      if (hasSignature || pdfDoc.catalog.has(PDFName.of('Perms'))) {
        setError('برای حفظ اعتبار امضای دیجیتال، این فایل بازنویسی نمی‌شود.');
        setState('ready');
        return;
      }
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const paginationArtifact = PDFOperator.of(PDFOperatorNames.BeginMarkedContentSequence, [
        PDFName.of('Artifact'),
        '<< /Type /Pagination >>',
      ]);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page) {
          continue;
        }

        const crop = page.getCropBox();
        const angle = ((page.getRotation().angle % 360) + 360) % 360;
        const sideways = angle === 90 || angle === 270;
        const width = sideways ? crop.height : crop.width;
        const height = sideways ? crop.width : crop.height;
        const text = `${i + 1} / ${pages.length}`;
        const inset = Math.min(30, width / 5, height / 5);
        const size = Math.min(
          fontSize,
          (width - 2 * inset) / font.widthOfTextAtSize(text, 1),
          (height - 2 * inset) / font.heightAtSize(1),
        );
        const textWidth = font.widthOfTextAtSize(text, size);
        const textHeight = font.heightAtSize(size);

        let x: number;
        let y: number;

        switch (position) {
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = inset;
            break;
          case 'bottom-right':
            x = width - textWidth - inset;
            y = inset;
            break;
          case 'bottom-left':
            x = inset;
            y = inset;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - inset - textHeight;
            break;
          default:
            x = (width - textWidth) / 2;
            y = inset;
        }

        const origins: Record<number, [number, number]> = {
          0: [x, y],
          90: [crop.width - y, x],
          180: [crop.width - x, crop.height - y],
          270: [y, crop.height - x],
        };
        const [localX, localY] = origins[angle] ?? [x, y];
        page.pushOperators(paginationArtifact);
        page.drawText(text, {
          x: crop.x + localX,
          y: crop.y + localY,
          size,
          rotate: degrees(angle),
          font,
          color: rgb(0, 0, 0),
        });
        page.pushOperators(endMarkedContent());
      }

      const pdfBytes = await pdfDoc.save({ addDefaultPage: false, updateFieldAppearances: false });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const name = `${fileName.replace(/\.pdf$/i, '')}_numbered.pdf`;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownload({ url, name });

      setState('done');
    } catch {
      setError('خطا در پردازش فایل.');
      setState('error');
    }
  }, [fileName, position, fontSize]);

  const handleReset = useCallback(() => {
    setDownload(null);
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">افزودن شماره صفحه به PDF</h1>
        <p className="text-lg text-(--text-secondary)">شماره صفحه را به فایل PDF اضافه کنید</p>
      </div>

      <Card className="p-6 space-y-4">
        {state === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-(--text-muted)">
              فایل PDF خود را برای افزودن شماره صفحه انتخاب کنید.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              aria-label="انتخاب فایل PDF"
              className="block w-full text-sm text-(--text-muted) file:ms-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-(--text-inverted) hover:file:opacity-90"
            />
          </div>
        )}

        {state === 'loading' && (
          <div className="text-center text-(--text-muted) py-4">در حال بارگذاری فایل...</div>
        )}

        {(state === 'ready' || state === 'processing' || state === 'done') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-secondary)">فایل:</span>
              <span className="font-medium text-(--text-primary)">{fileName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--text-secondary)">تعداد صفحات:</span>
              <span className="font-medium text-(--text-primary)">{pageCount}</span>
            </div>

            <div className="border-t border-(--border-light) pt-4 space-y-4">
              <div>
                <label
                  htmlFor="page-number-position"
                  className="block text-sm font-medium text-(--text-primary) mb-1"
                >
                  موقعیت شماره صفحه
                </label>
                <select
                  id="page-number-position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value as typeof position)}
                  className="w-full px-4 py-2 rounded-md border border-(--border-light) bg-(--surface-1) text-(--text-primary) text-sm"
                >
                  <option value="bottom-center">پایین وسط</option>
                  <option value="bottom-right">پایین راست</option>
                  <option value="bottom-left">پایین چپ</option>
                  <option value="top-center">بالا وسط</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="page-number-size"
                  className="block text-sm font-medium text-(--text-primary) mb-1"
                >
                  اندازه فونت: {fontSize}
                </label>
                <input
                  id="page-number-size"
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
                {(() => {
                  if (state === 'processing') {
                    return 'در حال پردازش...';
                  }
                  if (state === 'done') {
                    return 'دانلود شد';
                  }
                  return 'افزودن شماره صفحه';
                })()}
              </Button>
              <Button variant="secondary" onClick={handleReset} disabled={state === 'processing'}>
                فایل جدید
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <div
            role="alert"
            className="p-4 bg-[rgba(239,68,68,0.12)] rounded-md text-danger text-sm"
          >
            {error}
            {state === 'error' && <Button onClick={handleReset}>فایل جدید</Button>}
          </div>
        ) : null}

        {state === 'done' && download ? (
          <div className="p-4 bg-[rgba(16,185,129,0.12)] rounded-md text-success text-sm">
            <a href={download.url} download={download.name} className="font-semibold underline">
              دانلود فایل شماره‌گذاری‌شده
            </a>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
