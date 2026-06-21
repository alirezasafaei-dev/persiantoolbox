'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';
type FormatOption = { value: OutputFormat; label: string; ext: string };

const FORMATS: FormatOption[] = [
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];

const MAX_DIMENSION = 4096;

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResizeImagePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockRatio, setLockRatio] = useState(true);
  const [busy, setBusy] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [quality, setQuality] = useState(85);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const ratioRef = useRef(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files?.[0]) {
      return;
    }
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }
    setError(null);
    setOriginalSize(file.size);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setResultUrl(null);
    setResultSize(0);
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      ratioRef.current = img.naturalWidth / img.naturalHeight;
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  }, []);

  const handleWidthChange = useCallback(
    (val: number) => {
      const clamped = Math.min(Math.max(1, val), MAX_DIMENSION);
      setWidth(clamped);
      if (lockRatio && imgRef.current) {
        setHeight(Math.round(clamped / ratioRef.current));
      }
    },
    [lockRatio],
  );

  const handleHeightChange = useCallback(
    (val: number) => {
      const clamped = Math.min(Math.max(1, val), MAX_DIMENSION);
      setHeight(clamped);
      if (lockRatio && imgRef.current) {
        setWidth(Math.round(clamped * ratioRef.current));
      }
    },
    [lockRatio],
  );

  const resize = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('مرورگر شما از Canvas پشتیبانی نمی‌کند');
        setBusy(false);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      const mime = format;
      const q = mime === 'image/png' ? undefined : quality / 100;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (resultUrl) {
              URL.revokeObjectURL(resultUrl);
            }
            setResultUrl(URL.createObjectURL(blob));
            setResultSize(blob.size);
          }
          setBusy(false);
        },
        mime,
        q,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در پردازش تصویر');
      setBusy(false);
    }
  }, [width, height, format, quality, resultUrl]);

  const download = useCallback(() => {
    if (!resultUrl) {
      return;
    }
    const ext = FORMATS.find((f) => f.value === format)?.ext ?? 'jpg';
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `resized-${width}x${height}.${ext}`;
    a.click();
  }, [resultUrl, width, height, format]);

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <Card className="p-6 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
          aria-label="انتخاب تصویر"
        />
        <Button onClick={() => fileInputRef.current?.click()} fullWidth>
          {originalUrl ? 'انتخاب تصویر جدید' : 'انتخاب تصویر'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {originalUrl && (
          <div className="space-y-4">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              <div>
                <label htmlFor="resize-width" className="text-xs text-[var(--text-muted)]">
                  عرض
                </label>
                <input
                  id="resize-width"
                  type="number"
                  min="1"
                  max={MAX_DIMENSION}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="resize-height" className="text-xs text-[var(--text-muted)]">
                  ارتفاع
                </label>
                <input
                  id="resize-height"
                  type="number"
                  min="1"
                  max={MAX_DIMENSION}
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">فرمت</label>
                <div className="flex gap-1 mt-1">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      className={`flex-1 px-2 py-2 rounded text-xs font-semibold transition-all ${
                        format === f.value
                          ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">
                  کیفیت: {format === 'image/png' ? '---' : `${quality}%`}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={format === 'image/png'}
                  className="w-full mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLockRatio(!lockRatio)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${lockRatio ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-light)]'}`}
                aria-pressed={lockRatio}
              >
                {lockRatio ? '🔒' : '🔓'}
              </button>
              <Button onClick={resize} disabled={busy} className="flex-1">
                {busy ? 'در حال پردازش...' : 'تغییر اندازه'}
              </Button>
            </div>

            {originalSize > 0 && (
              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <span>اصلی: {formatBytes(originalSize)}</span>
                {resultSize > 0 && <span>خروجی: {formatBytes(resultSize)}</span>}
                {resultSize > 0 && (
                  <span className={resultSize < originalSize ? 'text-green-600' : 'text-red-500'}>
                    {resultSize < originalSize
                      ? `صرفه‌جویی ${((1 - resultSize / originalSize) * 100).toFixed(0)}%`
                      : `حجم افزایش ${((resultSize / originalSize - 1) * 100).toFixed(0)}%`}
                  </span>
                )}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)]">اصلی</div>
                <div className="relative rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden">
                  <Image
                    src={originalUrl}
                    alt="تصویر اصلی"
                    width={400}
                    height={300}
                    className="w-full h-auto"
                    unoptimized
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)]">
                  خروجی ({width}×{height})
                </div>
                <div className="relative rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden bg-[var(--bg-subtle)]">
                  {resultUrl ? (
                    <Image
                      src={resultUrl}
                      alt="تصویر خروجی"
                      width={400}
                      height={300}
                      className="w-full h-auto"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-sm text-[var(--text-muted)]">
                      روی تغییر اندازه کلیک کنید
                    </div>
                  )}
                </div>
              </div>
            </div>

            {resultUrl && (
              <Button onClick={download} fullWidth>
                دانلود تصویر
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
