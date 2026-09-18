'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const tools = [
  { label: 'محاسبه حقوق', href: '/salary' },
  { label: 'محاسبه وام', href: '/loan' },
  { label: 'ابزار PDF', href: '/pdf-tools' },
  { label: 'تبدیل تاریخ', href: '/date-tools/shamsi-gregorian' },
];

export default function QuickToolsFAB() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="absolute bottom-[60px] right-0 flex min-w-[160px] flex-col gap-2 rounded-lg border border-(--border-light) bg-(--surface-1) p-2 shadow-strong">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-secondary) focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t.label}
            </Link>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        aria-label="ابزارهای سریع"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        className="flex h-12 w-12 items-center justify-center rounded-full border-none bg-primary text-(--text-inverted) shadow-medium transition-colors hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-primary)"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
    </div>
  );
}
