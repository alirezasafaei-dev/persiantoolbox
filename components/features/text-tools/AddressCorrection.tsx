'use client';

import { useState } from 'react';
import { useToast } from '@/shared/ui/toast-context';
import {
  calculateConfidence,
  type ConfidenceLevel,
  type ConfidenceResult,
} from '@/features/text-tools/address-fa-to-en/confidence';

type FieldEntry = {
  key: string;
  label: string;
  persian: string;
  english: string;
};

type AddressCorrectionProps = {
  fields: FieldEntry[];
  onCorrect: (key: string, correctedEnglish: string) => void;
};

const confidenceBadge: Record<ConfidenceLevel, { label: string; className: string }> = {
  high: {
    label: 'تأییدشده',
    className:
      'border-[rgb(var(--color-success-rgb)/0.35)] bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
  },
  medium: {
    label: 'تخمینی',
    className:
      'border-[rgb(var(--color-warning-rgb)/0.35)] bg-[rgb(var(--color-warning-rgb)/0.14)] text-[var(--color-warning)]',
  },
  low: {
    label: 'نیازمند بررسی',
    className:
      'border-[rgb(var(--color-danger-rgb)/0.35)] bg-[rgb(var(--color-danger-rgb)/0.12)] text-[var(--color-danger)]',
  },
};

function Badge({ result }: { result: ConfidenceResult }) {
  const badge = confidenceBadge[result.level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
      title={result.reason}
    >
      {badge.label}
      <span className="opacity-60">{result.score}%</span>
    </span>
  );
}

export default function AddressCorrection({ fields, onCorrect }: AddressCorrectionProps) {
  const { showToast } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (field: FieldEntry) => {
    setEditingKey(field.key);
    setEditValue(field.english);
  };

  const handleSave = (key: string) => {
    if (!editValue.trim()) {
      showToast('مقدار نمی‌تواند خالی باشد', 'error');
      return;
    }
    onCorrect(key, editValue.trim());
    setEditingKey(null);
    showToast('اصلاح ثبت شد', 'success');
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const copyText = async (value: string, label: string) => {
    if (!value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value.trim());
      showToast(`${label} کپی شد`, 'success');
    } catch {
      showToast('کپی انجام نشد', 'error');
    }
  };

  return (
    <div className="space-y-2">
      {fields.map((field) => {
        const result = calculateConfidence(field.persian, field.english, field.key);
        const isEditing = editingKey === field.key;
        const needsCorrection = result.level !== 'high';

        return (
          <div
            key={field.key}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-[var(--text-muted)]">{field.label}</span>
              <Badge result={result} />
            </div>

            <div className="text-sm text-[var(--text-primary)] mb-2" dir="ltr">
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSave(field.key);
                    }
                    if (event.key === 'Escape') {
                      handleCancel();
                    }
                  }}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-primary)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label={`اصلاح املای ${field.label}`}
                />
              ) : (
                <span>{field.english ? field.english : '—'}</span>
              )}
            </div>

            <div className="text-[11px] text-[var(--text-muted)] mb-2" dir="rtl">
              {field.persian ? field.persian : '—'}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm text-[11px]"
                    onClick={() => handleSave(field.key)}
                  >
                    ذخیره
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm text-[11px]"
                    onClick={handleCancel}
                  >
                    انصراف
                  </button>
                </>
              ) : (
                <>
                  {needsCorrection ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm text-[11px]"
                      onClick={() => handleStartEdit(field)}
                    >
                      اصلاح املا
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm text-[11px]"
                    onClick={() => copyText(field.english, field.label)}
                  >
                    کپی
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
