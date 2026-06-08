'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui';

export default function QrCodeGenerator() {
  const [text, setText] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = () => {
    if (!text || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple QR-like pattern (for demo - in production use a QR library)
    ctx.fillStyle = '#000000';
    const size = qrSize;
    const moduleSize = size / 25; // 25x25 grid

    // Generate deterministic pattern from text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    // Draw finder patterns (corners)
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawFinder(0, 0);
    drawFinder(18, 0);
    drawFinder(0, 18);

    // Draw data modules
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        if ((x < 9 && y < 9) || (x >= 16 && y < 9) || (x < 9 && y >= 16)) {
          continue; // Skip finder patterns
        }
        const moduleHash = (hash >> (x * y)) & 1;
        if (moduleHash) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  };

  const downloadQR = () => {
    if (!canvasRef.current) {
      return;
    }
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">تولیدکننده QR Code</h3>
        <p className="text-sm text-[var(--text-muted)]">
          متن یا URL را وارد کنید تا QR Code تولید شود.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            متن یا URL
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن یا URL را وارد کنید..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-y min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            اندازه QR Code: {qrSize}px
          </label>
          <input
            type="range"
            min="100"
            max="400"
            step="50"
            value={qrSize}
            onChange={(e) => setQrSize(Number.parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={generateQRCode}
            disabled={!text}
            className="flex-1 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            تولید QR Code
          </button>
          <button
            onClick={downloadQR}
            className="flex-1 bg-[var(--surface-2)] text-[var(--text-primary)] px-4 py-2 rounded-md hover:bg-[var(--surface-3)] transition-colors"
          >
            دانلود PNG
          </button>
        </div>
      </div>

      {text && (
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={qrSize}
            height={qrSize}
            className="border border-[var(--border-light)] rounded-md"
          />
        </div>
      )}
    </Card>
  );
}
