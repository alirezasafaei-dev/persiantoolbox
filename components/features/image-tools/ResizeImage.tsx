'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';


function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      return;
    }
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
      setWidth(val);
      if (lockRatio && imgRef.current) {
        setHeight(Math.round(val / ratioRef.current));
      }
    },
    [lockRatio],
  );

  const handleHeightChange = useCallback(
    (val: number) => {
      setHeight(val);
      if (lockRatio && imgRef.current) {
        setWidth(Math.round(val * ratioRef.current));
      }
    },
    [lockRatio],
  );

  const resize = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) {
      return;
    }
    setBusy(true);
    const img = imgRef.current;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) {
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
      }
      setBusy(false);
    }, 'image/png');
  }, [width, height]);

  const download = useCallback(() => {
    if (!resultUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `resized-${width}x${height}.png`;
    a.click();
  }, [resultUrl, width, height]);

  return (
    <div className="space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-success-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            تغییر اندازه تصویر
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            اندازه تصویر را به پیکسل دلخواه تغییر دهید. پردازش کاملاً محلی در مرورگر.
          </p>
        </div>
      </section>

      <Card className="p-6 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
          aria-label="انتخاب تصویر"
        />
        <Button onClick={() => fileInputRef.current?.click()} className="w-full">
          {originalUrl ? 'انتخاب تصویر جدید' : 'انتخاب تصویر'}
        </Button>

        {originalUrl && (
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div>
                <label htmlFor="resize-width" className="text-xs text-[var(--text-muted)]">
                  عرض (پیکسل)
                </label>
                <input
                  id="resize-width"
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                  aria-label="عرض تصویر"
                />
              </div>
              <div>
                <label htmlFor="resize-height" className="text-xs text-[var(--text-muted)]">
                  ارتفاع (پیکسل)
                </label>
                <input
                  id="resize-height"
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                  aria-label="ارتفاع تصویر"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setLockRatio(!lockRatio)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${lockRatio ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)]'}`}
                  aria-pressed={lockRatio}
                >
                  {lockRatio ? 'قفل نسبت 🔒' : 'آزاد 🔓'}
                </button>
              </div>
              <div className="flex items-end">
                <Button onClick={resize} disabled={busy} className="w-full">
                  {busy ? 'در حال پردازش...' : 'تغییر اندازه'}
                </Button>
              </div>
            </div>

            {originalSize > 0 && (
              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <span>حجم اصلی: {formatBytes(originalSize)}</span>
                {resultSize > 0 && <span>حجم خروجی: {formatBytes(resultSize)}</span>}
                {resultSize > 0 && (
                  <span>صرفه‌جویی: {((1 - resultSize / originalSize) * 100).toFixed(1)}%</span>
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
                      alt="تصویر تغییر اندازه یافته"
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
              <Button onClick={download} className="w-full">
                دانلود تصویر تغییر اندازه یافته
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
