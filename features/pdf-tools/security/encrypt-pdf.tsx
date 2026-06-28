'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { loadPdfLib } from '@/features/pdf-tools/lazy-deps';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
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
      const encryptedBytes = await encryptPDF(
        new Uint8Array(fileRef.current),
        password,
        ownerPassword || null,
      );

      const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
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
          <div className="space-y-4">
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
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && inputRef.current) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(droppedFile);
                  inputRef.current.files = dataTransfer.files;
                  inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                aria-label="انتخاب فایل PDF"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">🔒</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  فایل PDF را اینجا بکشید
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  یا کلیک کنید تا فایل انتخاب کنید
                </div>
              </div>
            </div>
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
              این ابزار فایل PDF شما را با رمزگذاری RC4 128 بیتی محافظت می‌کند. تمام پردازش‌ها در
              مرورگر شما انجام می‌شود و فایل به هیچ سروری ارسال نمی‌شود.
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
          <li>- فایل خروجی با رمزگذاری RC4 128 بیتی محافظت می‌شود.</li>
        </ul>
      </Card>
    </div>
  );
}
