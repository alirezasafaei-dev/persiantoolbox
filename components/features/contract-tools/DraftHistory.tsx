'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import type { ContractTemplateId } from '@/lib/contract-tools/types';
import { loadDrafts, deleteDraft, type DraftRecord } from '@/lib/contract-tools/draft-storage';

type Props = {
  templateId: ContractTemplateId;
  onLoadDraft: (draft: DraftRecord) => void;
};

function formatDateShort(ts: number): string {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts));
}

export default function DraftHistory({ templateId, onLoadDraft }: Props) {
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(loadDrafts(templateId));
  }, [templateId]);

  const handleDelete = (draftId: string) => {
    deleteDraft(templateId, draftId);
    setDrafts(loadDrafts(templateId));
    setConfirmDelete(null);
  };

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-muted)]">
        پیش‌نویس ذخیره‌شده‌ای وجود ندارد.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--text-primary)]">
        پیش‌نویس‌های ذخیره‌شده ({drafts.length})
      </h3>
      <div className="space-y-2">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {draft.name || `پیش‌نویس ${formatDateShort(draft.createdAt)}`}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                آخرین ویرایش: {formatDateShort(draft.updatedAt)}
              </div>
            </div>
            <div className="flex items-center gap-2 ms-3">
              <Button variant="tertiary" size="sm" onClick={() => onLoadDraft(draft)}>
                بارگذاری
              </Button>
              {confirmDelete === draft.id ? (
                <div className="flex items-center gap-1">
                  <Button variant="tertiary" size="sm" onClick={() => setConfirmDelete(null)}>
                    انصراف
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[var(--color-danger)] text-white"
                    onClick={() => handleDelete(draft.id)}
                  >
                    حذف
                  </Button>
                </div>
              ) : (
                <Button variant="tertiary" size="sm" onClick={() => setConfirmDelete(draft.id)}>
                  حذف
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
