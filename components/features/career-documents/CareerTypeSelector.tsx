'use client';

import type { CareerDocumentType } from '@/lib/career-documents/types';
import { DOCUMENT_TYPES } from '@/lib/career-documents/schemas';

type Props = {
  selected: CareerDocumentType | null;
  onSelect: (type: CareerDocumentType) => void;
};

const ICONS: Record<CareerDocumentType, string> = {
  'resume-fa': '📄',
  'resume-en': '📝',
  'cover-letter': '✉️',
};

export default function CareerTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-(--text-primary)">نوع سند را انتخاب کنید</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {DOCUMENT_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.documentType)}
            className={`text-right rounded-md border p-5 transition-all ${
              selected === t.documentType
                ? 'border-primary bg-[rgb(var(--color-primary-rgb)/0.05)]'
                : 'border-(--border-light) bg-(--surface-1) hover:border-primary'
            }`}
          >
            <div className="text-3xl mb-3">{ICONS[t.documentType]}</div>
            <div className="text-base font-bold text-(--text-primary)">{t.title}</div>
            <div className="text-xs text-(--text-muted) mt-2 leading-5">{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
