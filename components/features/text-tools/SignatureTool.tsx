'use client';

import { useState, useRef, useCallback, useEffect, type MouseEvent, type TouchEvent } from 'react';

export default function SignatureTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(3);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = useCallback((e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) {
        return { x: 0, y: 0 };
      }
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDraw = useCallback(
    (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const pos = getPos(e);
      setIsDrawing(true);
      setLastPoint(pos);
      setHasSignature(true);
    },
    [getPos],
  );

  const draw = useCallback(
    (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing || !lastPoint) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const pos = getPos(e);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPoint(pos);
    },
    [isDrawing, lastPoint, penColor, penWidth, getPos],
  );

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
  };

  const downloadPNG = (transparent: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const link = document.createElement('a');

    if (transparent) {
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width;
      tmpCanvas.height = canvas.height;
      const tmpCtx = tmpCanvas.getContext('2d');
      if (!tmpCtx) {
        return;
      }
      tmpCtx.drawImage(canvas, 0, 0);
      tmpCtx.globalCompositeOperation = 'destination-in';
      tmpCtx.fillStyle = '#000';
      tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
      link.download = 'signature-transparent.png';
      link.href = tmpCanvas.toDataURL('image/png');
    } else {
      link.download = 'signature.png';
      link.href = canvas.toDataURL('image/png');
    }

    link.click();
  };

  const colors = ['#000000', '#0000ff', '#006400', '#8b0000', '#4a4a4a'];

  return (
    <div className="space-y-8 py-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">امضای آنلاین</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          امضای دیجیتال خود را بکشید و دانلود کنید. خروجی PNG با پس‌زمینه شفاف یا سفید.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">رنگ:</span>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setPenColor(c)}
                  className={`h-6 w-6 rounded-full border-2 ${
                    penColor === c
                      ? 'border-[var(--color-primary)]'
                      : 'border-[var(--border-light)]'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">ضخامت:</span>
              <input
                type="range"
                min={1}
                max={8}
                value={penWidth}
                onChange={(e) => setPenWidth(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-[var(--text-muted)]">{penWidth}px</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-light)] bg-[var(--surface-1)]">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair"
              style={{ height: 200, touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          <p className="text-center text-xs text-[var(--text-muted)]">
            با ماوس یا لمس صفحه امضا بکشید
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={clearCanvas}
              className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
            >
              پاک کردن
            </button>
            <button
              onClick={() => downloadPNG(false)}
              disabled={!hasSignature}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              دانلود PNG (سفید)
            </button>
            <button
              onClick={() => downloadPNG(true)}
              disabled={!hasSignature}
              className="rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              دانلود PNG (شفاف)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">نحوه استفاده</h3>
            <ol className="mt-2 space-y-2 text-xs text-[var(--text-secondary)]">
              <li>۱. رنگ و ضخامت قلم را انتخاب کنید</li>
              <li>۲. در کادر سفید امضا بکشید</li>
              <li>۳. دانلود با پس‌زمینه سفید یا شفاف</li>
              <li>۴. تصویر را در اسناد خود قرار دهید</li>
            </ol>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">کاربردها</h3>
            <ul className="mt-2 space-y-1 text-xs text-[var(--text-secondary)]">
              <li>• اسناد رسمی و قراردادها</li>
              <li>• فرم‌های آنلاین</li>
              <li>• ایمیل‌های حرفه‌ای</li>
              <li>• پروپوزال‌ها</li>
            </ul>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-4">
            <p className="text-xs font-semibold text-[var(--color-success)]">پردازش کاملاً محلی</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              امضای شما به سرور ارسال نمی‌شود و فقط در مرورگر ذخیره می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
