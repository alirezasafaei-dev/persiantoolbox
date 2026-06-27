'use client';

import { useState } from 'react';

const ENAMAD_URL = 'https://trustseal.enamad.ir/?id=747528&Code=FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv';
const ENAMAD_IMG_URL =
  'https://trustseal.enamad.ir/logo.aspx?id=747528&Code=FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv';

export default function EnamadSeal() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <a
        href={ENAMAD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-xs text-[var(--text-muted)] hover:border-[var(--color-primary)] transition-all"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>نماد اعتماد الکترونیکی</span>
      </a>
    );
  }

  return (
    <a href={ENAMAD_URL} target="_blank" rel="noopener noreferrer" referrerPolicy="origin">
      <img
        referrerPolicy="origin"
        src={ENAMAD_IMG_URL}
        alt="نماد اعتماد الکترونیکی enamad"
        style={{ cursor: 'pointer' }}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </a>
  );
}
