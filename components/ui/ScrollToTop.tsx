'use client';

import { useEffect, useState } from 'react';

const baseClasses =
  'fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border-none bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)] transition-all duration-300';
const focusClasses =
  'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visibilityClasses = visible
    ? 'pointer-events-auto opacity-100 scale-100'
    : 'pointer-events-none opacity-0 scale-90';

  return (
    <button
      type="button"
      aria-label="بازگشت به بالا"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`${baseClasses} ${visibilityClasses} ${focusClasses}`}
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
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
