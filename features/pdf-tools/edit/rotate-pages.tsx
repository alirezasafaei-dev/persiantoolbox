'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Alert from '@/shared/ui/Alert';
import { createPdfWorkerClient, type PdfWorkerClient } from '@/features/pdf-tools/workerClient';
import { parsePageRanges } from '@/features/pdf-tools/utils/pageRanges';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

const rotations = [90, 180, 270] as const;
type RotationValue = (typeof rotations)[number];

export default function RotatePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesInput, setPagesInput] = useState('1');
  const [rotation, setRotation] = useState<RotationValue>(90);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
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

  const onSelectFile = async (fileList: FileList | null) => {
    setError(null);
    setTotalPages(null);
    setDownloadUrl(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const selected = fileList[0];
    if (!selected || selected.type !== 'application/pdf') {
      setError('فقط فایل PDF قابل انتخاب است.');
      return;
    }

    try {
      const worker = getWorker();
      const buffer = await selected.arrayBuffer();
      const pages = await worker.countPages({ file: buffer });
      setTotalPages(pages);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
      return;
    }

    setFile(selected);
  };

  const onRotate = async () => {
    setError(null);
    setProgress(0);
    if (!file) {
      setError('ابتدا فایل PDF را انتخاب کنید.');
      return;
    }
    if (!totalPages) {
      setError('تعداد صفحات فایل مشخص نیست.');
      return;
    }

    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const pages = parsePageRanges(pagesInput, totalPages);
      if (pages.length === 0) {
        throw new Error('هیچ صفحه ای انتخاب نشده است.');
      }

      const worker = getWorker();
      const result = await worker.request(
        { type: 'rotate', file: buffer, pages, rotation },
        (value) => setProgress(Math.round(value * 100)),
      );
      const blob = new Blob([result.buffer], { type: 'application/pdf' });

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

  const rotationLabel = useMemo(() => {
    switch (rotation) {
      case 180:
        return '۱۸۰ درجه';
      case 270:
        return '۲۷۰ درجه';
      default:
        return '۹۰ درجه';
    }
  }, [rotation]);

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">چرخش صفحات</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            صفحات انتخابی را با زاویه دلخواه بچرخانید
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="rotate-pages-file"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              انتخاب فایل PDF
            </label>
            <input
              id="rotate-pages-file"
              type="file"
              accept="application/pdf"
              onChange={(e) => onSelectFile(e.target.files)}
              className="input-field"
            />
          </div>

          {file && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {file.name} | تعداد صفحات: {totalPages ?? '-'}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label
              htmlFor="rotate-pages-input"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              صفحات مورد نظر
            </label>
            <input
              id="rotate-pages-input"
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="مثال: 1-3,5,8"
              className="input-field"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {rotations.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRotation(value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
                  rotation === value
                    ? 'border-transparent bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {value}°
              </button>
            ))}
            <span className="text-xs text-[var(--text-muted)]">
              زاویه انتخاب‌شده: {rotationLabel}
            </span>
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
            <Button type="button" onClick={onRotate} disabled={busy}>
              {busy ? 'در حال چرخش...' : 'چرخش صفحات'}
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

          {downloadUrl && (
            <Alert variant="success">
              فایل آماده است.{' '}
              <a
                className="font-semibold underline"
                href={downloadUrl}
                download="rotated.pdf"
                onClick={() =>
                  void recordHistory({
                    tool: 'pdf-rotate',
                    inputSummary: `صفحات: ${pagesInput} | چرخش: ${rotationLabel}`,
                    outputSummary: 'دانلود فایل چرخش‌یافته',
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
