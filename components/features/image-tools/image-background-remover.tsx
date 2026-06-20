'use client';

import { useState, useCallback, useRef, useEffect, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

type CropPreset = { label: string; ratio: number | null };

const PRESETS: CropPreset[] = [
  { label: 'آزاد', ratio: null },
  { label: 'مربع', ratio: 1 },
  { label: '۱۶:۹', ratio: 16 / 9 },
  { label: '۴:۳', ratio: 4 / 3 },
  { label: '۳:۲', ratio: 3 / 2 },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [preset, setPreset] = useState<CropPreset>(PRESETS[0]!);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type.startsWith('image/')) {
      setFile(selected);
      setResult(null);
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreview(url);
        const img = new Image();
        img.onload = () => {
          setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
          setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
        };
        img.src = url;
      };
      reader.readAsDataURL(selected);
    }
  }, []);

  useEffect(() => {
    if (!imgSize || !containerRef.current) {
      return;
    }
    const container = containerRef.current;
    const displayW = container.clientWidth;
    const displayH = (imgSize.h / imgSize.w) * displayW;
    container.style.height = `${displayH}px`;
  }, [imgSize, preview]);

  const setCropFromPreset = useCallback(
    (p: CropPreset) => {
      setPreset(p);
      if (!imgSize) {
        return;
      }
      if (!p.ratio) {
        setCrop({ x: 0, y: 0, w: imgSize.w, h: imgSize.h });
        return;
      }
      const imgRatio = imgSize.w / imgSize.h;
      let w: number, h: number;
      if (p.ratio > imgRatio) {
        w = imgSize.w;
        h = imgSize.w / p.ratio;
      } else {
        h = imgSize.h;
        w = imgSize.h * p.ratio;
      }
      setCrop({
        x: Math.round((imgSize.w - w) / 2),
        y: Math.round((imgSize.h - h) / 2),
        w: Math.round(w),
        h: Math.round(h),
      });
    },
    [imgSize],
  );

  const updateCropField = useCallback(
    (field: 'x' | 'y' | 'w' | 'h', value: number) => {
      if (!imgSize) {
        return;
      }
      setCrop((prev) => {
        const next = { ...prev, [field]: Math.max(0, value) };
        if (field === 'w') {
          next.w = Math.min(value, imgSize.w - next.x);
        }
        if (field === 'h') {
          next.h = Math.min(value, imgSize.h - next.y);
        }
        if (field === 'x') {
          next.x = Math.min(value, imgSize.w - prev.w);
        }
        if (field === 'y') {
          next.y = Math.min(value, imgSize.h - prev.h);
        }
        return next;
      });
    },
    [imgSize],
  );

  const processCrop = useCallback(async () => {
    if (!preview || !imgSize) {
      return;
    }
    setProcessing(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('load failed'));
        img.src = preview;
      });

      const canvas = document.createElement('canvas');
      canvas.width = crop.w;
      canvas.height = crop.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('no canvas');
      }

      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('export failed'))), 'image/png');
      });

      setResult({
        url: URL.createObjectURL(blob),
        blob,
        width: crop.w,
        height: crop.h,
      });
    } catch {
      setResult(null);
    } finally {
      setProcessing(false);
    }
  }, [preview, imgSize, crop]);

  const download = useCallback(() => {
    if (!result || !file) {
      return;
    }
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}-cropped.png`;
    a.click();
  }, [result, file]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">برش تصویر</h2>

          <div className="border-2 border-dashed border-[var(--border-medium)] rounded-lg p-8 text-center">
            <p className="text-[var(--text-secondary)] mb-4">تصویر را انتخاب کنید</p>
            <input
              id="img-crop-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="img-crop-upload" className="cursor-pointer">
              <span className="text-[var(--color-primary)] hover:underline">انتخاب تصویر</span>
            </label>
            {file && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {file.name} — {formatBytes(file.size)}
              </p>
            )}
          </div>

          {preview && imgSize && (
            <>
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      variant={preset.label === p.label ? 'primary' : 'secondary'}
                      onClick={() => setCropFromPreset(p)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div
                ref={containerRef}
                className="relative border border-[var(--border-medium)] rounded-lg overflow-hidden bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="تصویر اصلی" className="w-full h-full object-cover" />
                <div
                  className="absolute border-2 border-dashed border-white bg-white/20 cursor-move"
                  style={{
                    left: `${(crop.x / imgSize.w) * 100}%`,
                    top: `${(crop.y / imgSize.h) * 100}%`,
                    width: `${(crop.w / imgSize.w) * 100}%`,
                    height: `${(crop.h / imgSize.h) * 100}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'X', value: crop.x, field: 'x' as const, max: imgSize.w },
                  { label: 'Y', value: crop.y, field: 'y' as const, max: imgSize.h },
                  { label: 'عرض', value: crop.w, field: 'w' as const, max: imgSize.w },
                  { label: 'ارتفاع', value: crop.h, field: 'h' as const, max: imgSize.h },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">
                      {item.label}
                    </label>
                    <input
                      type="number"
                      value={item.value}
                      min="1"
                      max={item.max}
                      onChange={(e) => updateCropField(item.field, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded text-sm text-[var(--text-primary)]"
                    />
                  </div>
                ))}
              </div>

              <Button onClick={processCrop} disabled={processing} fullWidth>
                {processing ? <LoadingSpinner size="sm" /> : 'برش تصویر'}
              </Button>
            </>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="تصویر بریده شده"
                  className="max-h-64 rounded-lg border border-[var(--border-light)]"
                />
              </div>
              <div className="flex gap-4 justify-center text-sm text-[var(--text-muted)]">
                <span>
                  ابعاد: {result.width}×{result.height}
                </span>
                <span>حجم: {formatBytes(result.blob.size)}</span>
              </div>
              <Button onClick={download} fullWidth>
                دانلود تصویر بریده شده
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
