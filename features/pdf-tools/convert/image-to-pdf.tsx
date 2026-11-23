'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { loadPdfLib } from '@/features/pdf-tools/lazy-deps';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import { formatBytesFa } from '@/shared/utils/format';

const MAX_IMAGE_MIB = 20;
const MAX_BATCH_MIB = 50;
const MAX_IMAGES = 20;
const MIB = 1024 * 1024;
const MAX_IMAGE_PIXELS = 8_000_000;
const MAX_PNG_BATCH_PIXELS = 24_000_000;

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
} as const;

type PageSize = 'auto' | 'a4' | 'letter';
type PageOrientation = 'auto' | 'portrait' | 'landscape';

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  pngPixels: number;
};

async function readPngPixels(file: File): Promise<number> {
  const header = new DataView(await file.slice(0, 24).arrayBuffer());
  if (
    header.byteLength !== 24 ||
    header.getUint32(0) !== 0x89504e47 ||
    header.getUint32(4) !== 0x0d0a1a0a ||
    header.getUint32(8) !== 13 ||
    header.getUint32(12) !== 0x49484452
  ) {
    throw new Error('ساختار PNG معتبر نیست.');
  }
  const width = header.getUint32(16);
  const height = header.getUint32(20);
  if (!width || !height || width * height > MAX_IMAGE_PIXELS) {
    throw new Error('ابعاد PNG باید معتبر و حداکثر ۸ میلیون پیکسل باشد.');
  }
  return width * height;
}

async function fileToPngBytes(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  if (bitmap.width * bitmap.height > MAX_IMAGE_PIXELS) {
    bitmap.close();
    throw new Error('ابعاد تصویر برای تبدیل بیش از ۸ میلیون پیکسل است.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('مرورگر از پردازش تصویر پشتیبانی نمی کند.');
  }
  try {
    ctx.drawImage(bitmap, 0, 0);
  } finally {
    bitmap.close();
  }
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  }).finally(() => {
    canvas.width = 0;
    canvas.height = 0;
  });
  if (!blob) {
    throw new Error('تبدیل تصویر ناموفق بود.');
  }
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('auto');
  const [orientation, setOrientation] = useState<PageOrientation>('auto');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const previews = useRef(new Set<string>());
  const active = useRef(false);
  const selecting = useRef(false);
  const [checkingImages, setCheckingImages] = useState(false);

  useEffect(() => {
    const urls = previews.current;
    active.current = true;
    return () => {
      active.current = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const totalSize = useMemo(() => images.reduce((sum, item) => sum + item.file.size, 0), [images]);

  const onSelectImages = async (fileList: FileList | null) => {
    if (busy || selecting.current || !fileList?.length) {
      return;
    }
    const selectedFiles = Array.from(fileList);
    selecting.current = true;
    setCheckingImages(true);
    setError(null);

    try {
      const next: ImageItem[] = [];
      const errors = new Set<string>();
      let batchSize = totalSize;
      let batchPngPixels = images.reduce((sum, image) => sum + image.pngPixels, 0);
      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          errors.add(`${file.name}: فقط فایل تصویری پذیرفته می‌شود.`);
          continue;
        }
        if (!file.size || file.size > MAX_IMAGE_MIB * MIB) {
          errors.add(
            `${file.name}: تصویر باید غیرخالی و حداکثر ${MAX_IMAGE_MIB.toLocaleString('fa-IR')} مگابایت باشد.`,
          );
          continue;
        }
        if (images.length + next.length >= MAX_IMAGES) {
          errors.add(`حداکثر ${MAX_IMAGES.toLocaleString('fa-IR')} تصویر قابل انتخاب است.`);
          continue;
        }
        if (batchSize + file.size > MAX_BATCH_MIB * MIB) {
          errors.add(
            `${file.name}: حجم مجموع تصاویر از ${MAX_BATCH_MIB.toLocaleString('fa-IR')} مگابایت بیشتر می‌شود.`,
          );
          continue;
        }
        let pngPixels = 0;
        if (file.type === 'image/png') {
          try {
            pngPixels = await readPngPixels(file);
          } catch (cause) {
            errors.add(
              `${file.name}: ${cause instanceof Error ? cause.message : 'خواندن تصویر ممکن نبود.'}`,
            );
            continue;
          }
        }
        if (!active.current) {
          return;
        }
        if (batchPngPixels + pngPixels > MAX_PNG_BATCH_PIXELS) {
          errors.add(`${file.name}: مجموع تصاویر PNG نباید بیشتر از ۲۴ میلیون پیکسل باشد.`);
          continue;
        }
        batchPngPixels += pngPixels;
        batchSize += file.size;
        const previewUrl = URL.createObjectURL(file);
        previews.current.add(previewUrl);
        next.push({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl,
          pngPixels,
        });
      }

      if (!active.current) {
        return;
      }
      if (errors.size) {
        setError([...errors].slice(0, 3).join(' | '));
      }
      if (next.length === 0) {
        return;
      }

      setDownloadUrl(null);
      setImages((prev) => [...prev, ...next]);
    } finally {
      selecting.current = false;
      if (active.current) {
        setCheckingImages(false);
      }
    }
  };

  const removeImage = (id: string) => {
    const target = images.find((image) => image.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
      previews.current.delete(target.previewUrl);
    }
    setImages((prev) => prev.filter((item) => item.id !== id));
    setDownloadUrl(null);
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setDownloadUrl(null);
    setImages((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) {
        return prev;
      }
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }
      const removed = next.splice(index, 1);
      const item = removed[0];
      if (!item) {
        return prev;
      }
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const resolvePageSize = (imageWidth: number, imageHeight: number) => {
    if (pageSize === 'auto') {
      return { width: imageWidth, height: imageHeight };
    }

    const base = PAGE_SIZES[pageSize];
    if (orientation === 'landscape' || (orientation === 'auto' && imageWidth > imageHeight)) {
      return { width: base.height, height: base.width };
    }
    return { width: base.width, height: base.height };
  };

  const onConvert = async () => {
    if (selecting.current) {
      return;
    }
    setError(null);
    if (images.length === 0) {
      setError('حداقل یک تصویر انتخاب کنید.');
      return;
    }

    setBusy(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.create();

      for (const item of images) {
        let image;

        if (item.file.type === 'image/png') {
          image = await pdf.embedPng(await item.file.arrayBuffer());
        } else if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
          image = await pdf.embedJpg(await item.file.arrayBuffer());
        } else {
          image = await pdf.embedPng(await fileToPngBytes(item.file));
        }

        const { width, height } = image.scale(1);
        const pageSizeResolved = resolvePageSize(width, height);
        const page = pdf.addPage([pageSizeResolved.width, pageSizeResolved.height]);
        const scale = Math.min(pageSizeResolved.width / width, pageSizeResolved.height / height);
        const drawWidth = width * scale;
        const drawHeight = height * scale;
        const x = (pageSizeResolved.width - drawWidth) / 2;
        const y = (pageSizeResolved.height - drawHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      if (active.current) {
        setDownloadUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--text-primary) mb-2">تبدیل عکس به PDF</h1>
          <p className="text-lg text-(--text-secondary)">چند تصویر را به یک فایل PDF تبدیل کنید</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="image-to-pdf-files"
              className="text-sm font-semibold text-(--text-primary)"
            >
              تصاویر خود را اینجا بکشید یا انتخاب کنید
            </label>
            <div
              className="pdf-file-dropzone relative rounded-md border-2 border-dashed border-(--border-medium) bg-(--surface-2) p-8 text-center transition-colors hover:border-primary hover:bg-[rgb(var(--color-primary-rgb)/0.05)]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  'border-primary',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  'border-primary',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  'border-primary',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
                void onSelectImages(e.dataTransfer.files);
              }}
            >
              <input
                id="image-to-pdf-files"
                type="file"
                aria-label="انتخاب تصویر"
                accept="image/*"
                multiple
                disabled={busy || checkingImages}
                aria-describedby="image-to-pdf-limits"
                onChange={(event) => {
                  void onSelectImages(event.currentTarget.files);
                  event.currentTarget.value = '';
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">🖼️</div>
                <div className="text-sm font-semibold text-(--text-primary)">
                  تصاویر را اینجا بکشید
                </div>
                <div className="text-xs text-(--text-muted)">
                  یا کلیک کنید تا تصاویر انتخاب کنید
                </div>
              </div>
            </div>
          </div>

          <p id="image-to-pdf-limits" className="text-xs text-(--text-muted)">
            حداکثر {MAX_IMAGES.toLocaleString('fa-IR')} تصویر،{' '}
            {MAX_IMAGE_MIB.toLocaleString('fa-IR')} مگابایت برای هر تصویر و{' '}
            {MAX_BATCH_MIB.toLocaleString('fa-IR')} مگابایت در مجموع. هر تصویر PNG حداکثر ۸ میلیون
            پیکسل و مجموع PNGها حداکثر ۲۴ میلیون پیکسل.
          </p>

          {images.length > 0 && (
            <div className="grid gap-3">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-md border border-(--border-light) bg-(--surface-1) p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="text-sm text-(--text-primary)">
                      <div className="wrap-anywhere font-semibold">
                        {index + 1}. <bdi>{item.file.name}</bdi>
                      </div>
                      <div className="text-(--text-muted)">{formatBytesFa(item.file.size)}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => moveImage(item.id, 'up')}
                      disabled={busy || checkingImages || index === 0}
                    >
                      بالا
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => moveImage(item.id, 'down')}
                      disabled={busy || checkingImages || index === images.length - 1}
                    >
                      پایین
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeImage(item.id)}
                      disabled={busy || checkingImages}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="image-to-pdf-page-size"
                className="text-sm font-semibold text-(--text-primary)"
              >
                اندازه صفحه
              </label>
              <select
                id="image-to-pdf-page-size"
                className="input-field"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSize)}
              >
                <option value="auto">خودکار (ابعاد تصویر)</option>
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="image-to-pdf-orientation"
                className="text-sm font-semibold text-(--text-primary)"
              >
                جهت صفحه
              </label>
              <select
                id="image-to-pdf-orientation"
                className="input-field"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                disabled={pageSize === 'auto'}
              >
                <option value="auto">خودکار</option>
                <option value="portrait">عمودی</option>
                <option value="landscape">افقی</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-(--text-muted)">
              تعداد تصاویر: {images.length} | حجم کل: {formatBytesFa(totalSize)}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  previews.current.forEach((url) => URL.revokeObjectURL(url));
                  previews.current.clear();
                  setImages([]);
                  setDownloadUrl(null);
                }}
                disabled={busy || checkingImages || images.length === 0}
              >
                پاک کردن لیست
              </Button>
              <Button type="button" onClick={onConvert} disabled={busy || checkingImages}>
                {busy ? 'در حال تبدیل...' : 'تبدیل به PDF'}
              </Button>
            </div>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          {downloadUrl ? (
            <Alert variant="success">
              فایل آماده است.{' '}
              <a
                className="font-semibold underline"
                href={downloadUrl}
                download="images.pdf"
                onClick={() =>
                  void recordHistory({
                    tool: 'image-to-pdf',
                    inputSummary: `تعداد تصاویر: ${images.length}`,
                    outputSummary: 'دانلود فایل PDF',
                  })
                }
              >
                دانلود فایل
              </a>
            </Alert>
          ) : null}
        </Card>
        <RecentHistoryCard
          title="آخرین عملیات PDF"
          toolPrefixes={['pdf-']}
          toolIds={['image-to-pdf']}
        />
      </div>
    </div>
  );
}
