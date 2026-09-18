'use client';

import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="بستن مدال"
      />
      <div
        className={`relative ${maxWidth} w-full rounded-lg border border-(--border-light) bg-(--surface-1) p-6 shadow-strong`}
      >
        <div className="mb-4 flex items-center justify-between">
          {title ? <h2 className="text-lg font-bold text-(--text-primary)">{title}</h2> : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text-primary)"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
