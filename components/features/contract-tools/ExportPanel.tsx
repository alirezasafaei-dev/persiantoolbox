'use client';

import { useState } from 'react';
import { generateDocx, downloadBlob } from '@/lib/contract-tools/export/docx';
import { generatePdf } from '@/lib/contract-tools/export/pdf';

type Props = {
  renderedText: string;
  templateId: string;
  isPremium: boolean;
  onUpgrade?: () => void;
};

export default function ExportPanel({ renderedText, templateId, isPremium, onUpgrade }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDocxExport = async () => {
    setError(null);
    setLoading('docx');
    try {
      const blob = await generateDocx(renderedText);
      downloadBlob(blob, `contract-${templateId}-${Date.now()}.docx`);
    } catch {
      setError('خطا در تولید فایل Word');
    } finally {
      setLoading(null);
    }
  };

  const handlePdfExport = async (clean: boolean) => {
    setError(null);
    setLoading(clean ? 'pdf-clean' : 'pdf-draft');
    try {
      const bytes = await generatePdf(renderedText, {
        includeWatermark: !clean,
      });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const suffix = clean ? 'final' : 'draft';
      downloadBlob(blob, `contract-${templateId}-${suffix}-${Date.now()}.pdf`);
    } catch {
      setError('خطا در تولید فایل PDF');
    } finally {
      setLoading(null);
    }
  };

  const handleTextExport = () => {
    const blob = new Blob([renderedText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `contract-${templateId}-${Date.now()}.txt`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-[var(--text-primary)]">دانلود خروجی</h3>

      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 text-sm text-[var(--color-danger)]"
        >
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={handleTextExport}
          className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-right hover:border-[var(--color-primary)] transition-colors"
        >
          <div className="text-sm font-bold text-[var(--text-primary)]">فایل متنی</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">TXT — رایگان</div>
        </button>

        <button
          type="button"
          onClick={() => void handlePdfExport(false)}
          disabled={loading !== null}
          className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-right hover:border-[var(--color-primary)] transition-colors disabled:opacity-50"
        >
          <div className="text-sm font-bold text-[var(--text-primary)]">PDF با واترمارک</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">پیش‌نویس — رایگان</div>
          {loading === 'pdf-draft' && (
            <div className="text-xs text-[var(--color-primary)] mt-1">در حال تولید...</div>
          )}
        </button>

        <button
          type="button"
          onClick={() => (isPremium ? void handlePdfExport(true) : onUpgrade?.())}
          disabled={loading !== null && !isPremium}
          className={`rounded-[var(--radius-md)] border p-4 text-right transition-colors disabled:opacity-50 ${
            isPremium
              ? 'border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.05)] hover:bg-[rgb(var(--color-primary-rgb)/0.1)]'
              : 'border-[var(--border-light)] bg-[var(--surface-1)] opacity-75'
          }`}
        >
          <div className="text-sm font-bold text-[var(--text-primary)]">
            PDF تمیز
            {!isPremium && (
              <span className="mr-2 inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                حرفه‌ای
              </span>
            )}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {isPremium ? 'بدون واترمارک' : 'بدون واترمارک — نیاز به اشتراک'}
          </div>
          {loading === 'pdf-clean' && (
            <div className="text-xs text-[var(--color-primary)] mt-1">در حال تولید...</div>
          )}
        </button>

        <button
          type="button"
          onClick={() => (isPremium ? void handleDocxExport() : onUpgrade?.())}
          disabled={loading !== null && !isPremium}
          className={`rounded-[var(--radius-md)] border p-4 text-right transition-colors disabled:opacity-50 ${
            isPremium
              ? 'border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.05)] hover:bg-[rgb(var(--color-primary-rgb)/0.1)]'
              : 'border-[var(--border-light)] bg-[var(--surface-1)] opacity-75'
          }`}
        >
          <div className="text-sm font-bold text-[var(--text-primary)]">
            Word
            {!isPremium && (
              <span className="mr-2 inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                حرفه‌ای
              </span>
            )}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {isPremium ? 'DOCX قابل ویرایش' : 'DOCX — نیاز به اشتراک'}
          </div>
          {loading === 'docx' && (
            <div className="text-xs text-[var(--color-primary)] mt-1">در حال تولید...</div>
          )}
        </button>
      </div>
    </div>
  );
}
