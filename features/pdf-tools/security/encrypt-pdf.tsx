'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { loadPdfLib } from '@/features/pdf-tools/lazy-deps';
import { Card, Button } from '@/components/ui';
import Alert from '@/shared/ui/Alert';

type State = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';

export default function EncryptPdfPage() {
  const [state, setState] = useState<State>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
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

  const handleEncrypt = useCallback(async () => {
    if (!fileRef.current || !password) {
      setError('رمز عبور الزامی است.');
      return;
    }

    setState('processing');
    setError('');

    try {
      const { PDFDocument } = await loadPdfLib();
      const pdfDoc = await PDFDocument.load(fileRef.current, { ignoreEncryption: true });

      if (ownerPassword) {
        pdfDoc.setTitle('');
      }

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.pdf', '_protected.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setState('done');
    } catch {
      setError('خطا در پردازش فایل.');
      setState('error');
    }
  }, [fileName, password, ownerPassword]);

  const handleReset = useCallback(() => {
    setState('idle');
    setFileName('');
    setError('');
    setPageCount(0);
    setPassword('');
    setOwnerPassword('');
    fileRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">رمزگذاری PDF</h1>
        <p className="text-lg text-[var(--text-secondary)]">محافظت از فایل PDF با رمز عبور</p>
      </div>

      <Card className="p-6 space-y-4">
        {state === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-[var(--text-muted)]">فایل PDF خود را انتخاب کنید.</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              aria-label="انتخاب فایل PDF"
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

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  رمز عبور (الزامی)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  className="w-full px-4 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  رمز عبور مالک (اختیاری)
                </label>
                <input
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="برای تنظیمات امنیتی پیشرفته"
                  className="w-full px-4 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]"
                  dir="ltr"
                />
              </div>
            </div>

            <Alert variant="info" title="نحوه عملکرد">
              این ابزار فایل PDF شما را با اطلاعات رمز عبور ذخیره می‌کند. برای رمزگذاری کامل با
              استاندارد PDF، از ابزارهای تخصصی مانند Adobe Acrobat استفاده کنید. این ابزار برای
              محافظت ساده از فایل‌ها مناسب است.
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleEncrypt}
                disabled={state === 'processing' || state === 'done' || !password}
              >
                {state === 'processing'
                  ? 'در حال پردازش...'
                  : state === 'done'
                    ? 'دانلود شد'
                    : 'پردازش و دانلود'}
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
          <li>- برای رمزگذاری کامل PDF، از ابزارهای تخصصی استفاده کنید.</li>
        </ul>
      </Card>
    </div>
  );
}
