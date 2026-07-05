'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ToolSearch = dynamic(() => import('@/components/home/ToolSearch'), {
  ssr: false,
  loading: () => <ToolSearchPlaceholder active />,
});

function ToolSearchPlaceholder({ active = false }: { active?: boolean }) {
  return (
    <span
      className="tool-search-container block w-full text-start"
      aria-label="آماده‌سازی جستجوی ابزارها"
    >
      <span className="tool-search-wrapper">
        <svg
          className="tool-search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="tool-search-input flex items-center text-[var(--text-muted)]">
          {active ? 'در حال آماده‌سازی جستجو...' : 'دنبال چه ابزاری می‌گردید؟'}
        </span>
      </span>
    </span>
  );
}

export default function LazyToolSearch() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) {
      return undefined;
    }

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setShouldLoad(true), { timeout: 1800 });
      return () => win.cancelIdleCallback?.(id);
    }

    const timeout = window.setTimeout(() => setShouldLoad(true), 900);
    return () => window.clearTimeout(timeout);
  }, [shouldLoad]);

  if (shouldLoad) {
    return <ToolSearch />;
  }

  return (
    <div onFocus={() => setShouldLoad(true)} onPointerEnter={() => setShouldLoad(true)}>
      <button
        type="button"
        className="block w-full border-0 bg-transparent p-0 text-inherit"
        onClick={() => setShouldLoad(true)}
      >
        <ToolSearchPlaceholder />
      </button>
    </div>
  );
}
