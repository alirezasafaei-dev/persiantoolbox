'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';


export default function TextOnImagePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
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

  const addText = useCallback(() => {
    if (!imgRef.current || !canvasRef.current || !text) {
      return;
    }
    setBusy(true);
    const img = imgRef.current;
    const canvas = canvasRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setBusy(false);
      return;
    }

    ctx.drawImage(img, 0, 0);

    ctx.fillStyle = fontColor;
    ctx.font = `bold ${fontSize * (img.naturalWidth / 800)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    let y: number;
    if (position === 'top') {
      y = fontSize * 2;
    } else if (position === 'bottom') {
      y = img.naturalHeight - fontSize;
    } else {
      y = img.naturalHeight / 2;
    }

    ctx.fillText(text, img.naturalWidth / 2, y);

    canvas.toBlob((blob) => {
      if (blob) {
        setResultUrl(URL.createObjectURL(blob));
      }
      setBusy(false);
    }, 'image/png');
  }, [text, fontSize, fontColor, position]);

  const download = useCallback(() => {
    if (!resultUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'text-on-image.png';
    a.click();
  }, [resultUrl]);

  return (
    <div className="space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-info-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            افزودن متن به تصویر
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            متن دلخواه را با رنگ و اندازه دلخواه روی تصویر قرار دهید. پردازش کاملاً محلی.
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
              <div className="col-span-2">
                <label htmlFor="text-on-img-text" className="text-xs text-[var(--text-muted)]">
                  متن
                </label>
                <input
                  id="text-on-img-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="متن مورد نظر..."
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  aria-label="متن روی تصویر"
                />
              </div>
              <div>
                <label htmlFor="text-on-img-size" className="text-xs text-[var(--text-muted)]">
                  اندازه فونت
                </label>
                <input
                  id="text-on-img-size"
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  aria-label="اندازه فونت"
                />
              </div>
              <div>
                <label htmlFor="text-on-img-color" className="text-xs text-[var(--text-muted)]">
                  رنگ متن
                </label>
                <input
                  id="text-on-img-color"
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full mt-1 h-10 rounded-[var(--radius-md)] border border-[var(--border-light)]"
                  aria-label="رنگ متن"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { value: 'top' as const, label: 'بالا' },
                { value: 'center' as const, label: 'وسط' },
                { value: 'bottom' as const, label: 'پایین' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPosition(opt.value)}
                  aria-pressed={position === opt.value}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${position === opt.value ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

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
                <div className="text-xs text-[var(--text-muted)]">خروجی</div>
                <div className="relative rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden bg-[var(--bg-subtle)]">
                  {resultUrl ? (
                    <Image
                      src={resultUrl}
                      alt="تصویر با متن"
                      width={400}
                      height={300}
                      className="w-full h-auto"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-sm text-[var(--text-muted)]">
                      متن را وارد کنید و روی افزودن کلیک کنید
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={addText} disabled={busy || !text}>
                {busy ? 'در حال پردازش...' : 'افزودن متن'}
              </Button>
              {resultUrl && <Button onClick={download}>دانلود</Button>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
