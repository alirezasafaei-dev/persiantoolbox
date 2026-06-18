'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';

function encodeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageToQRPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (files: FileList | null) => {
    if (!files?.[0]) {
      return;
    }
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      return;
    }
    const base64 = await encodeToBase64(file);
    setImageUrl(base64);
    setQrUrl(null);
  }, []);

  const generateQR = useCallback(() => {
    if (!text && !imageUrl) {
      return;
    }
    setBusy(true);
    const content = text ?? imageUrl ?? '';
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(content)}`;
    setQrUrl(qrApiUrl);
    setBusy(false);
  }, [text, imageUrl]);

  const downloadQR = useCallback(async () => {
    if (!qrUrl) {
      return;
    }
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.png';
    a.click();
    URL.revokeObjectURL(url);
  }, [qrUrl]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-info-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            تولید QR Code
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            متن، URL یا تصویر خود را به QR Code تبدیل کنید. دانلود رایگان با کیفیت بالا.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">ورودی</h2>
          <div>
            <label htmlFor="qr-text" className="text-sm text-[var(--text-muted)]">
              متن یا URL
            </label>
            <input
              id="qr-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com یا متن دلخواه"
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="متن یا URL"
            />
          </div>
          <div className="text-center text-xs text-[var(--text-muted)]">یا</div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files)}
              aria-label="انتخاب تصویر"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              className="w-full"
            >
              {imageUrl ? 'انتخاب تصویر جدید' : 'انتخاب تصویر'}
            </Button>
          </div>
          {imageUrl && (
            <div className="space-y-2">
              <div className="text-xs text-[var(--text-muted)]">تصویر انتخاب شده</div>
              <div className="relative w-full h-32 rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="تصویر انتخاب شده"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}
          <Button onClick={generateQR} disabled={busy || (!text && !imageUrl)} className="w-full">
            {busy ? 'در حال تولید...' : 'تولید QR Code'}
          </Button>
        </Card>

        <Card className="p-6 space-y-4 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">خروجی</h2>
          {qrUrl ? (
            <div className="space-y-4 text-center">
              <div className="relative w-64 h-64 mx-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden bg-white">
                <Image src={qrUrl} alt="QR Code" fill className="object-contain p-4" unoptimized />
              </div>
              <Button onClick={downloadQR} className="w-full">
                دانلود QR Code
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-[var(--text-muted)] py-12">
              QR Code شما اینجا نمایش داده می‌شود
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
