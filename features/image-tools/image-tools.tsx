'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AsyncState, Button, Card, EmptyState, ProgressBar } from '@/components/ui';
import { formatBytesFa, formatPercentFa } from './utils/format';
import { formatNumberFa, parseLooseNumber } from '@/shared/utils/numbers';
import ImageDropzone from './components/ImageDropzone';
import { useImageToolsWorker } from './hooks/useImageToolsWorker';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import type {
  CompressionSettings,
  ImageCompressionPreset,
  ImageOutputFormat,
  ImageQueueItem,
} from './types/image-tools';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 8;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const QUALITY_MIN = 0.4;
const QUALITY_MAX = 0.95;

const PRESETS: ImageCompressionPreset[] = [
  {
    id: 'smart',
    label: 'متعادل',
    description: 'تعادل بین کیفیت و حجم برای استفاده روزمره',
    outputFormat: 'auto',
    quality: 0.78,
    maxDimension: 2200,
  },
  {
    id: 'hires',
    label: 'کیفیت بالا',
    description: 'مناسب چاپ و آرشیو با افت محسوس کم',
    outputFormat: 'image/jpeg',
    quality: 0.9,
    maxDimension: 0,
  },
  {
    id: 'compact',
    label: 'حداکثر فشرده',
    description: 'کمترین حجم برای اشتراک‌گذاری سریع',
    outputFormat: 'image/webp',
    quality: 0.6,
    maxDimension: 1600,
  },
];

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createQueueItem = (file: File): ImageQueueItem => ({
  id: createId(),
  file,
  originalUrl: URL.createObjectURL(file),
  originalSize: file.size,
  progress: 0,
  status: 'idle',
});

const getOutputMimeType = (fileType: string, format: ImageOutputFormat) => {
  if (format === 'auto') {
    if (fileType === 'image/png') {
      return 'image/png';
    }
    return 'image/webp';
  }
  return format;
};

const calculateSavings = (originalSize: number, compressedSize?: number) => {
  if (!compressedSize || originalSize <= 0) {
    return 0;
  }
  return Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);
};

export default function ImageToolsPage() {
  const [items, setItems] = useState<ImageQueueItem[]>([]);
  const itemsRef = useRef<ImageQueueItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>({
    outputFormat: 'auto',
    quality: 0.8,
    maxDimension: 0,
    backgroundColor: '#ffffff',
  });
  const [maxDimensionInput, setMaxDimensionInput] = useState('');
  const { compress, mode } = useImageToolsWorker();

  const canAddMore = items.length < MAX_FILES;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.originalUrl);
        if (item.result?.url) {
          URL.revokeObjectURL(item.result.url);
        }
      });
    };
  }, []);

  const totals = useMemo(() => {
    const original = items.reduce((sum, item) => sum + item.originalSize, 0);
    const compressed = items.reduce((sum, item) => sum + (item.result?.size ?? 0), 0);
    const savings =
      original > 0 && compressed > 0 ? Math.max(0, ((original - compressed) / original) * 100) : 0;
    return { original, compressed, savings };
  }, [items]);

  const handleFilesSelected = (files: FileList | null) => {
    setNotice(null);
    if (!files || files.length === 0) {
      return;
    }

    const nextItems: ImageQueueItem[] = [];
    const errors: string[] = [];

    Array.from(files).some((file) => {
      if (nextItems.length + items.length >= MAX_FILES) {
        errors.push(`حداکثر ${MAX_FILES} تصویر قابل انتخاب است.`);
        return true;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: فرمت فایل پشتیبانی نمی‌شود.`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: حجم بیش از ۲۰ مگابایت است.`);
        return false;
      }

      nextItems.push(createQueueItem(file));
      return false;
    });

    if (errors.length > 0) {
      setNotice(errors.slice(0, 2).join(' | '));
    }

    if (nextItems.length === 0) {
      return;
    }

    setItems((prev) => [...prev, ...nextItems]);

    if (typeof window === 'undefined') {
      return;
    }

    nextItems.forEach((item) => {
      const img = new window.Image();
      img.onload = () => {
        setItems((prev) =>
          prev.map((entry) => {
            if (entry.id !== item.id) {
              return entry;
            }
            return {
              ...entry,
              originalDimensions: { width: img.naturalWidth, height: img.naturalHeight },
            };
          }),
        );
      };
      img.src = item.originalUrl;
    });
  };

  const resetQueue = () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.result?.url) {
        URL.revokeObjectURL(item.result.url);
      }
    });
    setItems([]);
    setNotice(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.originalUrl);
        if (target.result?.url) {
          URL.revokeObjectURL(target.result.url);
        }
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateItem = (id: string, updater: (item: ImageQueueItem) => ImageQueueItem) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const runCompression = async (item: ImageQueueItem) => {
    updateItem(item.id, (current) => {
      const { error, ...rest } = current;
      void error;
      return {
        ...rest,
        status: 'processing',
        progress: 0,
      };
    });

    try {
      const buffer = await item.file.arrayBuffer();
      const outputType = getOutputMimeType(item.file.type, settings.outputFormat);
      const request = {
        buffer,
        mimeType: item.file.type,
        outputType,
        quality: settings.quality,
        ...(settings.maxDimension > 0
          ? { maxWidth: settings.maxDimension, maxHeight: settings.maxDimension }
          : {}),
        ...(settings.backgroundColor ? { backgroundColor: settings.backgroundColor } : {}),
      };
      const result = await compress(request, (value) => {
        updateItem(item.id, (current) => ({
          ...current,
          progress: Math.round(value * 100),
        }));
      });

      const blob = new Blob([result.buffer], { type: result.mimeType });
      const url = URL.createObjectURL(blob);

      updateItem(item.id, (current) => {
        if (current.result?.url) {
          URL.revokeObjectURL(current.result.url);
        }
        return {
          ...current,
          progress: 100,
          status: 'done',
          result: {
            blob,
            url,
            size: blob.size,
            width: result.width,
            height: result.height,
            mimeType: result.mimeType,
          },
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطای ناشناخته رخ داد.';
      updateItem(item.id, (current) => ({
        ...current,
        status: 'error',
        error: message,
      }));
    }
  };

  const runAll = async () => {
    setNotice(null);
    for (const item of items) {
      await runCompression(item);
    }
  };

  const compressSelected = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (target) {
      runCompression(target);
    }
  };

  const applyPreset = (preset: ImageCompressionPreset) => {
    setSettings((prev) => ({
      ...prev,
      outputFormat: preset.outputFormat,
      quality: preset.quality,
      maxDimension: preset.maxDimension,
    }));
    setMaxDimensionInput(preset.maxDimension > 0 ? String(preset.maxDimension) : '');
  };

  const updateMaxDimension = (value: string) => {
    setMaxDimensionInput(value);
    if (value.trim().length === 0) {
      setSettings((prev) => ({ ...prev, maxDimension: 0 }));
      return;
    }
    const numeric = parseLooseNumber(value);
    if (numeric === null) {
      return;
    }
    setSettings((prev) => ({
      ...prev,
      maxDimension: Math.max(0, Math.round(numeric)),
    }));
  };

  const hasProcessing = items.some((item) => item.status === 'processing');
  const hasItems = items.length > 0;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-info-rgb)/0.18),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            ابزارهای تصویر
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            فشرده‌سازی حرفه‌ای تصاویر با کنترل کامل روی کیفیت، اندازه و فرمت خروجی. همه‌چیز به‌صورت
            آفلاین روی دستگاه شما انجام می‌شود.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              پردازش {mode === 'worker' ? 'سریع با Web Worker' : 'ایمن روی مرورگر'}
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              حداکثر {MAX_FILES} تصویر همزمان
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              خروجی WebP، JPG، PNG
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <ImageDropzone
            onFilesSelected={handleFilesSelected}
            acceptedTypes={ACCEPTED_TYPES}
            disabled={!canAddMore || hasProcessing}
            maxFiles={MAX_FILES}
          />

          {notice && (
            <AsyncState variant="error" title="خطا در انتخاب فایل" description={notice} icon="⚠️" />
          )}

          {hasItems && (
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">خلاصه پردازش</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    وضعیت کلی حجم فایل‌ها و میزان صرفه‌جویی
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetQueue}
                    disabled={hasProcessing}
                  >
                    پاک کردن همه
                  </Button>
                  <Button type="button" onClick={runAll} disabled={hasProcessing}>
                    {hasProcessing ? 'در حال پردازش...' : 'پردازش همه'}
                  </Button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
                  <div className="text-xs text-[var(--text-muted)]">حجم اولیه</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                    {formatBytesFa(totals.original)}
                  </div>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
                  <div className="text-xs text-[var(--text-muted)]">حجم خروجی</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                    {totals.compressed > 0 ? formatBytesFa(totals.compressed) : '—'}
                  </div>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
                  <div className="text-xs text-[var(--text-muted)]">صرفه‌جویی</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                    {totals.compressed > 0 ? formatPercentFa(totals.savings) : '—'}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {!hasItems ? (
              <EmptyState
                icon="🖼️"
                title="هنوز تصویری اضافه نشده است"
                description="برای شروع، تصویرها را از بخش بالا انتخاب کنید یا فایل‌ها را بکشید و رها کنید."
              />
            ) : (
              items.map((item) => {
                const outputMimeType = getOutputMimeType(item.file.type, settings.outputFormat);
                const outputExtension =
                  outputMimeType === 'image/jpeg' ? 'jpg' : outputMimeType.split('/')[1];
                const savings = calculateSavings(item.originalSize, item.result?.size);

                return (
                  <Card key={item.id} className="p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {item.file.name}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          {formatBytesFa(item.originalSize)} ·{' '}
                          {item.file.type.replace('image/', '').toUpperCase()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeItem(item.id)}
                          disabled={item.status === 'processing'}
                        >
                          حذف
                        </Button>
                        <Button
                          type="button"
                          onClick={() => compressSelected(item.id)}
                          disabled={item.status === 'processing'}
                        >
                          {item.status === 'processing' ? 'در حال پردازش...' : 'پردازش'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-2">تصویر اصلی</div>
                        <Image
                          src={item.originalUrl}
                          alt={`تصویر اصلی ${item.file.name}`}
                          width={item.originalDimensions?.width ?? 1200}
                          height={item.originalDimensions?.height ?? 900}
                          className="w-full h-auto rounded-[var(--radius-lg)] border border-[var(--border-light)]"
                          sizes="100vw"
                          unoptimized
                        />
                        {item.originalDimensions && (
                          <div className="mt-2 text-xs text-[var(--text-muted)]">
                            ابعاد: {formatNumberFa(item.originalDimensions.width)}×
                            {formatNumberFa(item.originalDimensions.height)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] mb-2">خروجی فشرده</div>
                        {item.result ? (
                          <Image
                            src={item.result.url}
                            alt={`تصویر خروجی ${item.file.name}`}
                            width={item.result.width ?? 1200}
                            height={item.result.height ?? 900}
                            className="w-full h-auto rounded-[var(--radius-lg)] border border-[var(--border-light)]"
                            sizes="100vw"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-48 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-light)] text-sm text-[var(--text-muted)]">
                            هنوز خروجی تولید نشده است
                          </div>
                        )}
                        {item.result && (
                          <div className="mt-2 text-xs text-[var(--text-muted)]">
                            {formatBytesFa(item.result.size)} · صرفه‌جویی {formatPercentFa(savings)}
                            <span className="mx-2">|</span>
                            ابعاد: {formatNumberFa(item.result.width)}×
                            {formatNumberFa(item.result.height)}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.status === 'processing' && (
                      <div className="space-y-2">
                        <ProgressBar value={item.progress} label={`پیشرفت ${item.file.name}`} />
                        <div className="text-xs text-[var(--text-muted)]">
                          {formatPercentFa(item.progress, 0)}
                        </div>
                      </div>
                    )}

                    {item.error && (
                      <AsyncState
                        variant="error"
                        title="خطا در فشرده‌سازی"
                        description={item.error}
                      />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                      <div>
                        فرمت خروجی: {outputMimeType.replace('image/', '').toUpperCase()} · کیفیت{' '}
                        {formatPercentFa(settings.quality * 100, 0)}
                      </div>
                      {item.result && (
                        <a
                          className="font-semibold underline"
                          href={item.result.url}
                          download={`compressed-${item.file.name.replace(/\s+/g, '-')}.${outputExtension}`}
                          onClick={() =>
                            void recordHistory({
                              tool: 'image-compress',
                              inputSummary: `فایل: ${item.file.name}`,
                              outputSummary: `دانلود فایل با حجم ${formatBytesFa(
                                item.result?.size ?? 0,
                              )}`,
                            })
                          }
                        >
                          دانلود فایل
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">تنظیمات فشرده‌سازی</h2>
            <p className="text-sm text-[var(--text-muted)]">
              تنظیمات را برای تمام تصاویر اعمال کنید.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-[var(--text-primary)]">پیش‌تنظیم‌ها</div>
            <div className="grid gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rounded-[var(--radius-lg)] border border-[var(--border-light)] px-4 py-3 text-start transition-all hover:border-[var(--color-primary)] hover:bg-[var(--surface-2)]"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {preset.label}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="image-output-format"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                فرمت خروجی
              </label>
              <select
                id="image-output-format"
                className="input-field"
                value={settings.outputFormat}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    outputFormat: event.target.value as ImageOutputFormat,
                  }))
                }
              >
                <option value="auto">خودکار (پیشنهادی)</option>
                <option value="image/webp">WebP</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="image-quality"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                کیفیت خروجی
              </label>
              <input
                id="image-quality"
                type="range"
                min={QUALITY_MIN}
                max={QUALITY_MAX}
                step={0.05}
                value={settings.quality}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, quality: Number(event.target.value) }))
                }
              />
              <div className="text-xs text-[var(--text-muted)]">
                کیفیت فعلی: {formatPercentFa(settings.quality * 100, 0)}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="image-max-dimension"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                حداکثر ضلع (اختیاری)
              </label>
              <input
                id="image-max-dimension"
                type="text"
                inputMode="numeric"
                className="input-field"
                value={maxDimensionInput}
                placeholder="مثال: ۲۰۰۰"
                onChange={(event) => updateMaxDimension(event.target.value)}
              />
              <div className="text-xs text-[var(--text-muted)]">
                صفر یا خالی یعنی بدون تغییر اندازه.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="image-bg-color"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                پس‌زمینه JPG (برای تصاویر شفاف)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="image-bg-color"
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, backgroundColor: event.target.value }))
                  }
                  className="h-10 w-16 rounded-lg border border-[var(--border-light)]"
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  aria-label="مقدار رنگ پس‌زمینه JPG"
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, backgroundColor: event.target.value }))
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-4 text-sm text-[var(--text-muted)]">
            <p>
              نکته: اگر خروجی را روی JPG قرار دهید، تصاویر شفاف با رنگ پس‌زمینه انتخابی پر می‌شوند.
            </p>
          </div>
        </Card>
      </section>

      <RecentHistoryCard title="آخرین عملیات تصویر" toolPrefixes={['image-']} />
    </div>
  );
}
