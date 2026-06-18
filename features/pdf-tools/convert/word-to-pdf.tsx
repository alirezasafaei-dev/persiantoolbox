'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { Card, Button } from '@/components/ui';

type State = 'idle' | 'ready' | 'error';

export default function WordToPdfPage() {
  const [state, setState] = useState<State>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const validTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(doc|docx)$/i)) {
      setError('فقط فایل‌های Word (.doc, .docx) مجاز هستند.');
      setState('error');
      return;
    }

    fileRef.current = file;
    setFileName(file.name);
    setError('');

    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setState('ready');
  }, []);

  const handlePrintToPdf = useCallback(() => {
    if (!fileUrl) {
      return;
    }

    const printWindow = window.open(fileUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  }, [fileUrl]);

  const handleReset = useCallback(() => {
    setState('idle');
    setFileName('');
    setError('');
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl('');
    fileRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [fileUrl]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">تبدیل Word به PDF</h1>
        <p className="text-lg text-[var(--text-secondary)]">فایل Word را به PDF تبدیل کنید</p>
      </div>

      <Card className="p-6 space-y-4">
        {state === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              فایل Word (.doc یا .docx) خود را انتخاب کنید.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".doc,.docx"
              onChange={handleFileSelect}
              className="block w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-[var(--text-inverted)] hover:file:opacity-90"
            />
          </div>
        )}

        {state === 'ready' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">فایل:</span>
              <span className="font-medium text-[var(--text-primary)]">{fileName}</span>
            </div>

            <div className="p-4 bg-[rgba(59,130,246,0.12)] rounded-[var(--radius-md)] text-sm text-[var(--color-info)]">
              <p className="font-medium mb-2">نحوه تبدیل:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>روی دکمه &quot;تبدیل به PDF&quot; کلیک کنید.</li>
                <li>فایل در پنجره جدید باز می‌شود.</li>
                <li>در مرورگر، گزینه Print را انتخاب کنید (Ctrl+P).</li>
                <li>به عنوان Destination گزینه &quot;Save as PDF&quot; را انتخاب کنید.</li>
                <li>فایل PDF ذخیره می‌شود.</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handlePrintToPdf}>تبدیل به PDF</Button>
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
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">نکات</h3>
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          <li>- این ابزار از قابلیت چاپ مرورگر استفاده می‌کند.</li>
          <li>- تمام پردازش‌ها به صورت محلی انجام می‌شود.</li>
          <li>- فایل شما به هیچ سروری ارسال نمی‌شود.</li>
          <li>- برای نتیجه بهتر، از مرورگر Chrome استفاده کنید.</li>
        </ul>
      </Card>
    </div>
  );
}
