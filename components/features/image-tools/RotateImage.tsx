'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';

export default function RotateImagePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(90);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files?.[0]) {
      return;
    }
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setResultUrl(null);
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
    };
    img.src = url;
  }, []);

  const rotate = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) {
      return;
    }
    setBusy(true);
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    canvas.width = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
    canvas.height = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
      }
      setBusy(false);
    }, 'image/png');
  }, [rotation]);

  const download = useCallback(() => {
    if (!resultUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'rotated-image.png';
    a.click();
  }, [resultUrl]);

  return (
    <div className="space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-info-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">چرخش تصویر</h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            تصویر خود را با هر زاویه‌ای بچرخانید. پردازش کاملاً محلی در مرورگر.
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
            <div className="flex flex-wrap gap-3">
              {[90, 180, 270, -90].map((deg) => (
                <Button
                  key={deg}
                  variant={rotation === deg ? 'primary' : 'secondary'}
                  onClick={() => setRotation(deg)}
                >
                  {`${deg}°`}
                </Button>
              ))}
              <input
                type="number"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-20 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-center text-sm"
                aria-label="زاویه چرخش"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)]">اصلی</div>
                <div className="relative aspect-square rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden">
                  <Image
                    src={originalUrl}
                    alt="تصویر اصلی"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)]">خروجی</div>
                <div className="relative aspect-square rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden bg-[var(--bg-subtle)]">
                  {resultUrl ? (
                    <Image
                      src={resultUrl}
                      alt="تصویر چرخانده شده"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
                      روی چرخش کلیک کنید
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={rotate} disabled={busy}>
                {busy ? 'در حال پردازش...' : 'چرخش'}
              </Button>
              {resultUrl && <Button onClick={download}>دانلود</Button>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
