'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Card, Button } from '@/components/ui';
import Alert from '@/shared/ui/Alert';

type EncryptState = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';

export default function EncryptPdfPage() {
  const [state, setState] = useState<EncryptState>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
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

  const handleDownloadClean = useCallback(async () => {
    if (!fileRef.current) {
      return;
    }

    setState('processing');
    setError('');

    try {
      const pdfDoc = await PDFDocument.load(fileRef.current, { ignoreEncryption: true });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.pdf', '_clean.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setState('done');
    } catch {
      setError('خطا در پردازش فایل.');
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">رمزگذاری PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">افزودن رمز عبور به فایل PDF</p>
        </div>

        <Card className="p-6 space-y-4">
          {state === 'idle' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-[var(--text-muted)]">
                فایل PDF خود را برای رمزگذاری انتخاب کنید.
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

              <Alert variant="warning" title="محدودیت رمزگذاری در مرورگر">
                رمزگذاری مستقیم PDF در مرورگر با کتابخانه‌های موجود پشتیبانی نمی‌شود. برای رمزگذاری
                فایل PDF، از یکی از روش‌های زیر استفاده کنید:
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                  <li>از نرم‌افزار Adobe Acrobat استفاده کنید.</li>
                  <li>از ابزار آنلاین معتبر مانند SmallPDF استفاده کنید.</li>
                  <li>در سیستم‌عامل، از قابلیت Print to PDF با تنظیمات امنیتی استفاده کنید.</li>
                </ul>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownloadClean}
                  disabled={state === 'processing' || state === 'done'}
                >
                  {state === 'processing'
                    ? 'در حال پردازش...'
                    : state === 'done'
                      ? 'دانلود شد'
                      : 'دانلود فایل سالم'}
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  فایل جدید
                </Button>
              </div>
            </div>
          )}

          {state === 'error' && error && <Alert variant="danger">{error}</Alert>}

          {state === 'done' && (
            <Alert variant="success">فایل با موفقیت پردازش شد و دانلود آغاز شد.</Alert>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">نکات امنیتی</h3>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            <li>- تمام پردازش‌ها به صورت محلی در مرورگر شما انجام می‌شود.</li>
            <li>- فایل شما به هیچ سروری ارسال نمی‌شود.</li>
            <li>- برای رمزگذاری واقعی، از نرم‌افزارهای تخصصی استفاده کنید.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
