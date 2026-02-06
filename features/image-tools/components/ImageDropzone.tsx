'use client';

import type { DragEvent } from 'react';
import { useId, useState } from 'react';
import { Card } from '@/components/ui';
import { cx } from '@/shared/ui/cx';
import { formatNumberFa } from '@/shared/utils/numbers';

type Props = {
  onFilesSelected: (files: FileList | null) => void;
  acceptedTypes: string[];
  disabled?: boolean;
  maxFiles: number;
};

export default function ImageDropzone({
  onFilesSelected,
  acceptedTypes,
  disabled = false,
  maxFiles,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) {
      return;
    }
    setIsDragging(false);
    onFilesSelected(event.dataTransfer.files);
  };

  return (
    <Card
      className={cx(
        'relative border-2 border-dashed rounded-[var(--radius-lg)] transition-all duration-[var(--motion-medium)]',
        'bg-[var(--surface-1)] border-[var(--border-light)]',
        'hover:border-[var(--color-primary)] hover:bg-[var(--surface-2)]',
        isDragging && 'border-[var(--color-primary)] bg-[var(--surface-2)]',
        disabled && 'opacity-60 pointer-events-none',
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={(event) => onFilesSelected(event.target.files)}
        className="sr-only"
        disabled={disabled}
      />
      <label
        htmlFor={inputId}
        className={cx(
          'flex flex-col items-center justify-center text-center px-6 py-12 cursor-pointer',
          'gap-4',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-[color-mix(in srgb, var(--color-primary) 18%, transparent)]">
          <svg
            className="h-8 w-8 text-[var(--color-primary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15l4-4 4 4 4-4 6 6"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 3H3v14h18V3Z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            تصاویر را اینجا رها کنید یا کلیک کنید
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            حداکثر {formatNumberFa(maxFiles)} فایل | فرمت‌های مجاز: JPG، PNG، WebP
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm text-[var(--text-primary)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
          انتخاب چند تصویر همزمان
        </div>
      </label>
    </Card>
  );
}
