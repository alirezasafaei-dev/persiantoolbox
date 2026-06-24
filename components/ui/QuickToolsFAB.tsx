'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const tools = [
  { label: 'محاسبه حقوق', href: '/salary' },
  { label: 'محاسبه مالیات', href: '/tax' },
  { label: 'ابزار PDF', href: '/pdf-tools' },
  { label: 'تبدیل ارز', href: '/currency' },
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
    <div ref={ref} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg, 12px)',
            boxShadow: 'var(--shadow-strong)',
            padding: 8,
            minWidth: 160,
          }}
        >
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-label="ابزارهای سریع"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-primary)',
          color: 'var(--text-inverted)',
          boxShadow: 'var(--shadow-medium)',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
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
