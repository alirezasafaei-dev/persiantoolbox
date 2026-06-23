'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button } from '@/components/ui';

function encodeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const QR_MODULES = 25;
const QR_SIZE = 400;

function generateQRMatrix(text: string): boolean[][] {
  const size = QR_MODULES;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );

  const setData = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r]![c] = val;
    }
  };

  const drawFinderPattern = (startR: number, startC: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inMiddle = r >= 1 && r <= 5 && c >= 1 && c <= 5;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (inOuter && !inMiddle) {
          setData(startR + r, startC + c, true);
        } else if (inInner) {
          setData(startR + r, startC + c, true);
        } else if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          setData(startR + r, startC + c, false);
        }
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    setData(6, i, i % 2 === 0);
    setData(i, 6, i % 2 === 0);
  }

  for (let i = 0; i < 8; i++) {
    setData(8, i, i < 6);
    setData(i, 8, i < 6);
    setData(8, size - 1 - i, i < 6);
    setData(size - 1 - i, 8, i < 6);
  }

  setData(8, 8, true);

  const bits = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) {
      bits.push(1, 0);
      for (let b = 6; b >= 0; b--) {
        bits.push((code >> b) & 1);
      }
    } else if (code < 2048) {
      bits.push(1, 1, 0);
      for (let b = 10; b >= 6; b--) {
        bits.push((code >> b) & 1);
      }
      for (let b = 5; b >= 0; b--) {
        bits.push((code >> b) & 1);
      }
    } else {
      bits.push(1, 1, 1);
      for (let b = 15; b >= 12; b--) {
        bits.push((code >> b) & 1);
      }
      for (let b = 11; b >= 6; b--) {
        bits.push((code >> b) & 1);
      }
      for (let b = 5; b >= 0; b--) {
        bits.push((code >> b) & 1);
      }
    }
  }

  bits.push(0, 0, 0, 0);

  const dataCoords: [number, number][] = [];
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) {
      col = 5;
    }
    for (let row = 0; row < size; row++) {
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (c >= 0 && c < size) {
          const isReserved =
            (row < 9 && c < 9) ||
            (row < 9 && c >= size - 8) ||
            (row >= size - 8 && c < 9) ||
            row === 6 ||
            c === 6 ||
            (row === 8 && c < 9) ||
            (row === 8 && c >= size - 8) ||
            (row >= size - 8 && c === 8) ||
            (row < 9 && c === 8) ||
            row === 8;
          if (!isReserved) {
            dataCoords.push([row, c]);
          }
        }
      }
    }
  }

  for (let i = 0; i < dataCoords.length; i++) {
    const bit = i < bits.length ? bits[i]! : 0;
    const [r, c] = dataCoords[i]!;
    setData(r, c, bit === 1);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isFinderArea = (r < 9 && c < 9) || (r < 9 && c >= size - 8) || (r >= size - 8 && c < 9);
      if (!isFinderArea && (r + c) % 2 === 0) {
        if (matrix[r]![c] === false) {
          setData(r, c, true);
        }
      }
    }
  }

  return matrix;
}

function renderQRToCanvas(matrix: boolean[][], canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  canvas.width = QR_SIZE;
  canvas.height = QR_SIZE;

  const moduleSize = QR_SIZE / (matrix.length + 8);
  const margin = moduleSize * 4;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);

  ctx.fillStyle = '#000000';
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r]!.length; c++) {
      if (matrix[r]![c]) {
        ctx.fillRect(
          margin + c * moduleSize,
          margin + r * moduleSize,
          moduleSize + 0.5,
          moduleSize + 0.5,
        );
      }
    }
  }
}

export default function ImageToQRPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      const c = document.createElement('canvas');
      canvasRef.current = c;
    }
  }, []);

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
    setQrDataUrl(null);
  }, []);

  const generateQR = useCallback(() => {
    if (!text && !imageUrl) {
      return;
    }
    setBusy(true);
    try {
      const content = text ?? imageUrl ?? '';
      const matrix = generateQRMatrix(content);
      const canvas = canvasRef.current ?? document.createElement('canvas');
      renderQRToCanvas(matrix, canvas);
      setQrDataUrl(canvas.toDataURL('image/png'));
    } finally {
      setBusy(false);
    }
  }, [text, imageUrl]);

  const downloadQR = useCallback(() => {
    if (!qrDataUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qr-code.png';
    a.click();
  }, [qrDataUrl]);

  return (
    <div className="space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-info-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            تولید QR Code
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            متن، URL یا تصویر خود را به QR Code تبدیل کنید. پردازش کاملاً محلی — هیچ داده‌ای ارسال
            نمی‌شود.
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative w-full h-32 rounded-[var(--radius-lg)] border border-[var(--border-light)] overflow-hidden">
                <img
                  src={imageUrl}
                  alt="تصویر انتخاب شده"
                  className="w-full h-full object-contain"
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
          {qrDataUrl ? (
            <div className="space-y-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-64 h-64 mx-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] p-2 bg-[var(--surface-1)]"
              />
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
