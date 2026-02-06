'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

const POSITIONS = [
  { id: 'center', label: 'مرکز' },
  { id: 'top-left', label: 'بالا چپ' },
  { id: 'top-right', label: 'بالا راست' },
  { id: 'bottom-left', label: 'پایین چپ' },
  { id: 'bottom-right', label: 'پایین راست' },
] as const;

type Position = (typeof POSITIONS)[number]['id'];

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(2)} ${units[index]}`;
}

export default function AddWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('Sample Watermark');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.2);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<Position>('center');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<PdfWorkerClient | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const getWorker = () => {
    if (!workerRef.current) {
      workerRef.current = createPdfWorkerClient();
    }
    return workerRef.current;
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const originalSize = useMemo(() => file?.size ?? 0, [file]);

  const onSelectFile = (fileList: FileList | null) => {
    setError(null);
    setDownloadUrl(null);
    setResultSize(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const selected = fileList[0];
    if (!selected || selected.type !== 'application/pdf') {
      setError('فقط فایل PDF قابل انتخاب است.');
      return;
    }

    setFile(selected);
  };

  const onApply = async () => {
    setError(null);
    setProgress(0);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }
    if (text.trim().length === 0) {
      setError('متن واترمارک را وارد کنید.');
      return;
    }

    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const worker = getWorker();
      const result = await worker.request(
        { type: 'watermark', file: buffer, text, fontSize, opacity, rotation, position },
        (value) => setProgress(Math.round(value * 100)),
      );
      const blob = new Blob([result.buffer], { type: 'application/pdf' });

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">افزودن واترمارک</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            متن واترمارک را به همه صفحات PDF اضافه کنید
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="watermark-file"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              انتخاب فایل PDF
            </label>
            <input
              id="watermark-file"
              type="file"
              accept="application/pdf"
              onChange={(e) => onSelectFile(e.target.files)}
              className="input-field"
            />
          </div>

          {file && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {file.name} | حجم اولیه: {formatBytes(originalSize)}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="watermark-text"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                متن واترمارک
              </label>
              <input
                id="watermark-text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="مثال: محرمانه"
                className="input-field"
              />
              <div className="text-xs text-[var(--text-muted)]">
                فونت پیش فرض فقط حروف لاتین را به خوبی نمایش می دهد.
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="watermark-font-size"
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  اندازه فونت
                </label>
                <input
                  id="watermark-font-size"
                  type="number"
                  min={12}
                  max={120}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="input-field"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="watermark-opacity"
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  شفافیت
                </label>
                <input
                  id="watermark-opacity"
                  type="range"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                />
                <div className="text-xs text-[var(--text-muted)]">{Math.round(opacity * 100)}%</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="watermark-rotation"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                زاویه چرخش
              </label>
              <input
                id="watermark-rotation"
                type="number"
                min={-90}
                max={90}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="watermark-position"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                موقعیت
              </label>
              <select
                id="watermark-position"
                className="input-field"
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
              >
                {POSITIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFile(null)}
              disabled={busy || !file}
            >
              تغییر فایل
            </Button>
            <Button type="button" onClick={onApply} disabled={busy}>
              {busy ? 'در حال اعمال...' : 'اعمال واترمارک'}
            </Button>
          </div>

          {busy && (
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-[var(--text-muted)]">{progress}%</div>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {downloadUrl && resultSize !== null && (
            <Alert variant="success" className="space-y-2">
              <div>حجم خروجی: {formatBytes(resultSize)}</div>
              <div>
                <a
                  className="font-semibold underline"
                  href={downloadUrl}
                  download="watermarked.pdf"
                  onClick={() =>
                    void recordHistory({
                      tool: 'pdf-watermark',
                      inputSummary: `متن واترمارک: ${text.trim()}`,
                      outputSummary: `دانلود فایل با حجم ${formatBytes(resultSize)}`,
                    })
                  }
                >
                  دانلود فایل
                </a>
              </div>
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
