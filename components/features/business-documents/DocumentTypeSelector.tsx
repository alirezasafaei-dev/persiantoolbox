'use client';

import type { BusinessDocumentType } from '@/lib/business-documents/types';
import { DOCUMENT_TYPES } from '@/lib/business-documents/schemas';

type Props = {
  selected: BusinessDocumentType | null;
  onSelect: (type: BusinessDocumentType) => void;
};

const ICONS: Record<BusinessDocumentType, string> = {
  invoice: '🧾',
  proforma: '📋',
  receipt: '🧾',
};

export default function DocumentTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-(--text-primary)">نوع سند را انتخاب کنید</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {DOCUMENT_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`text-right rounded-md border p-5 transition-all ${
              selected === t.id
                ? 'border-primary bg-[rgb(var(--color-primary-rgb)/0.05)]'
                : 'border-(--border-light) bg-(--surface-1) hover:border-primary'
            }`}
          >
            <div className="text-3xl mb-3">{ICONS[t.id]}</div>
            <div className="text-base font-bold text-(--text-primary)">{t.title}</div>
            <div className="text-xs text-(--text-muted) mt-2 leading-5">{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
