'use client';

import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';
import Button from '@/shared/ui/Button';

export default function PersianOcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      return;
    }

    if (!selected.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    setFile(selected);
    setResult(null);
    setError(null);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }, []);

  const processOcr = useCallback(async () => {
    if (!file) {
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const Tesseract = await import('tesseract.js');

      const { data } = await Tesseract.recognize(file, 'fas+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = data.text.trim();
      if (!text) {
        setError('متنی از تصویر استخراج نشد. لطفاً تصویر واضح‌تری انتخاب کنید.');
      } else {
        setResult(text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در پردازش تصویر');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [file]);

  const copyToClipboard = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  }, [result]);

  const downloadText = useCallback(() => {
    if (!result) {
      return;
    }
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          استخراج متن از تصویر (OCR فارسی)
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          تصویر حاوی متن فارسی یا انگلیسی را انتخاب کنید تا متن آن به صورت خودکار استخراج شود. تمام
          پردازش‌ها در مرورگر انجام می‌شود و هیچ داده‌ای ارسال نمی‌شود.
        </p>

        <div
          className="border-2 border-dashed border-[var(--border-medium)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="انتخاب تصویر برای استخراج متن"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="انتخاب فایل تصویری"
          />
          {preview ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="پیش‌نمایش تصویر"
                className="max-h-48 mx-auto rounded-lg border border-[var(--border-light)]"
              />
              <p className="text-sm text-[var(--text-muted)]">{file?.name}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📷</div>
              <p className="text-sm text-[var(--text-muted)]">
                تصویر را اینجا رها کنید یا کلیک کنید
              </p>
            </div>
          )}
        </div>

        {processing ? (
          <div className="space-y-2" role="status" aria-live="polite">
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>در حال استخراج متن...</span>
              <span>%{progress}</span>
            </div>
            <div className="w-full bg-[var(--surface-2)] rounded-full h-2">
              <div
                className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        <Button onClick={processOcr} disabled={!file || processing} fullWidth>
          {processing ? 'در حال پردازش...' : 'استخراج متن'}
        </Button>
      </Card>

      {error ? (
        <Card
          className="p-4 border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.1)]"
          role="alert"
        >
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </Card>
      ) : null}

      {result ? (
        <Card className="p-6 space-y-4" aria-live="polite">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">متن استخراج شده</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={copyToClipboard}>
                کپی
              </Button>
              <Button variant="secondary" onClick={downloadText}>
                دانلود
              </Button>
            </div>
          </div>
          <div className="p-4 bg-[var(--surface-2)] rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-[var(--text-primary)] font-mono leading-relaxed">
              {result}
            </pre>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {result.split(/\s+/).length} کلمه • {result.length} کاراکتر
          </p>
        </Card>
      ) : null}
    </div>
  );
}
