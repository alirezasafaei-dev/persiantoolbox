'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { loadPdfLib } from '@/features/pdf-tools/lazy-deps';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

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
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(2)} ${units[index]}`;
}

async function fileToPngBytes(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('مرورگر از پردازش تصویر پشتیبانی نمی کند.');
  }
  ctx.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
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

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [downloadUrl, images]);

  const totalSize = useMemo(() => images.reduce((sum, item) => sum + item.file.size, 0), [images]);

  const onSelectImages = (fileList: FileList | null) => {
    setError(null);
    setDownloadUrl(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const next: ImageItem[] = [];
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      next.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl,
      });
    });

    if (next.length === 0) {
      setError('فقط فایل های تصویری قابل انتخاب هستند.');
      return;
    }

    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
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
        const buffer = await item.file.arrayBuffer();
        let imageBytes = new Uint8Array(buffer);
        let image;

        if (item.file.type === 'image/png') {
          image = await pdf.embedPng(imageBytes);
        } else if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
          image = await pdf.embedJpg(imageBytes);
        } else {
          imageBytes = await fileToPngBytes(item.file);
          image = await pdf.embedPng(imageBytes);
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
      setDownloadUrl(URL.createObjectURL(blob));
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
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">تبدیل عکس به PDF</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            چند تصویر را به یک فایل PDF تبدیل کنید
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="image-to-pdf-files"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              انتخاب تصاویر
            </label>
            <input
              id="image-to-pdf-files"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onSelectImages(e.target.files)}
              className="input-field"
            />
          </div>

          {images.length > 0 && (
            <div className="grid gap-3">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="text-sm text-[var(--text-primary)]">
                      <div className="font-semibold">
                        {index + 1}. {item.file.name}
                      </div>
                      <div className="text-[var(--text-muted)]">{formatBytes(item.file.size)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => moveImage(item.id, 'up')}
                      disabled={busy || index === 0}
                    >
                      بالا
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => moveImage(item.id, 'down')}
                      disabled={busy || index === images.length - 1}
                    >
                      پایین
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeImage(item.id)}
                      disabled={busy}
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
                className="text-sm font-semibold text-[var(--text-primary)]"
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
                className="text-sm font-semibold text-[var(--text-primary)]"
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
            <div className="text-sm text-[var(--text-muted)]">
              تعداد تصاویر: {images.length} | حجم کل: {formatBytes(totalSize)}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setImages([])}
                disabled={busy || images.length === 0}
              >
                پاک کردن لیست
              </Button>
              <Button type="button" onClick={onConvert} disabled={busy}>
                {busy ? 'در حال تبدیل...' : 'تبدیل به PDF'}
              </Button>
            </div>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {downloadUrl && (
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
          )}
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
