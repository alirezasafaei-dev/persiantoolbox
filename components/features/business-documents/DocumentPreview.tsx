'use client';

import { useMemo } from 'react';
import type { BusinessDocumentDraft, BusinessDocumentTotals } from '@/lib/business-documents/types';
import { DISCLAIMER } from '@/lib/business-documents/types';
import { renderDocument } from '@/lib/business-documents/render';

type Props = {
  draft: BusinessDocumentDraft;
  totals: BusinessDocumentTotals;
  showWatermark: boolean;
};

export default function DocumentPreview({ draft, totals, showWatermark }: Props) {
  const html = useMemo(
    () => renderDocument(draft, totals, { watermark: showWatermark, rtl: true }),
    [draft, totals, showWatermark],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش سند</h3>
        {showWatermark ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-warning)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-warning)]">
            پیش‌نویس رایگان
          </span>
        ) : null}
      </div>

      <div className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] overflow-hidden">
        <iframe
          srcDoc={html}
          sandbox="allow-same-origin"
          title="پیش‌نمایش سند"
          className="w-full min-h-[500px] md:min-h-[700px] bg-white"
          style={{ border: 'none' }}
        />
      </div>

      {showWatermark ? (
        <p className="text-xs text-[var(--color-warning)] text-center">
          در نسخه رایگان، واترمارک «ساخته‌شده با PersianToolbox» روی خروجی قرار می‌گیرد.
        </p>
      ) : null}

      <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
        <p className="text-xs text-[var(--text-muted)] leading-5">{DISCLAIMER}</p>
      </div>
    </div>
  );
}
