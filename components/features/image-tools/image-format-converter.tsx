'use client';

import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

const OUTPUT_FORMATS = [
  { value: 'image/jpeg', ext: 'jpg', label: 'JPG', mime: 'image/jpeg' },
  { value: 'image/png', ext: 'png', label: 'PNG', mime: 'image/png' },
  { value: 'image/webp', ext: 'webp', label: 'WebP', mime: 'image/webp' },
] as const;

type OutputFormat = (typeof OUTPUT_FORMATS)[number]['ext'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageFormatConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg');
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    blob: Blob;
    width: number;
    height: number;
    originalSize: number;
    outputSize: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type.startsWith('image/')) {
      setFile(selected);
      setResult(null);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  }, []);

  const processFile = useCallback(async () => {
    if (!file || !preview) {
      return;
    }
    setProcessing(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('خطا در بارگذاری تصویر'));
        img.src = preview;
      });

      const canvas = canvasRef.current ?? document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('مرورگر شما از Canvas پشتیبانی نمی‌کند');
      }

      if (outputFormat === 'jpg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const formatInfo = OUTPUT_FORMATS.find((f) => f.ext === outputFormat);
      if (!formatInfo) {
        throw new Error('فرمت نامعتبر');
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('خطا در تبدیل فرمت'))),
          formatInfo.mime,
          quality / 100,
        );
      });

      const url = URL.createObjectURL(blob);
      setResult({
        url,
        blob,
        width: img.naturalWidth,
        height: img.naturalHeight,
        originalSize: file.size,
        outputSize: blob.size,
      });
    } catch {
      setResult(null);
    } finally {
      setProcessing(false);
    }
  }, [file, preview, outputFormat, quality]);

  const download = useCallback(() => {
    if (!result || !file) {
      return;
    }
    const a = document.createElement('a');
    a.href = result.url;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}.${OUTPUT_FORMATS.find((f) => f.ext === outputFormat)?.ext ?? 'jpg'}`;
    a.click();
  }, [result, file, outputFormat]);

  const savings = result ? Math.round((1 - result.outputSize / result.originalSize) * 100) : 0;

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">تبدیل فرمت تصویر</h2>

          <div className="border-2 border-dashed border-[var(--border-medium)] rounded-lg p-8 text-center">
            <p className="text-[var(--text-secondary)] mb-4">تصویر را انتخاب کنید</p>
            <input
              id="img-convert-upload"
              type="file" aria-label="انتخاب تصویر"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="img-convert-upload" className="cursor-pointer">
              <span className="text-[var(--color-primary)] hover:underline">انتخاب تصویر</span>
            </label>
            {file ? (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {file.name} — {formatBytes(file.size)}
              </p>
            ) : null}
          </div>

          {preview ? (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="تصویر تبدیل شده"
                className="max-h-48 rounded-lg border border-[var(--border-light)]"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                فرمت خروجی
              </label>
              <div className="flex gap-2">
                {OUTPUT_FORMATS.map((fmt) => (
                  <Button
                    key={fmt.ext}
                    variant={outputFormat === fmt.ext ? 'primary' : 'secondary'}
                    onClick={() => {
                      setOutputFormat(fmt.ext);
                      setResult(null);
                    }}
                  >
                    {fmt.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                کیفیت: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setQuality(Number(e.target.value));
                  setResult(null);
                }}
                className="w-full"
              />
            </div>
          </div>

          <Button onClick={processFile} disabled={!file || processing} fullWidth>
            {processing ? <LoadingSpinner size="sm" /> : 'تبدیل فرمت'}
          </Button>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-[var(--surface-1)] rounded-lg text-center">
                  <p className="text-xs text-[var(--text-muted)]">ابعاد</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {result.width}×{result.height}
                  </p>
                </div>
                <div className="p-3 bg-[var(--surface-1)] rounded-lg text-center">
                  <p className="text-xs text-[var(--text-muted)]">حجم اصلی</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {formatBytes(result.originalSize)}
                  </p>
                </div>
                <div className="p-3 bg-[var(--surface-1)] rounded-lg text-center">
                  <p className="text-xs text-[var(--text-muted)]">حجم خروجی</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {formatBytes(result.outputSize)}
                  </p>
                </div>
                <div className="p-3 bg-[var(--surface-1)] rounded-lg text-center">
                  <p className="text-xs text-[var(--text-muted)]">صرفه‌جویی</p>
                  <p
                    className={`text-sm font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    %{savings}
                  </p>
                </div>
              </div>

              <Button onClick={download} fullWidth>
                دانلود تصویر تبدیل شده
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
