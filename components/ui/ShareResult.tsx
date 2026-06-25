'use client';

import { useState } from 'react';

interface ShareResultProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareResult({ title, text, url }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} | ${text}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // user cancelled
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${title}\n${text}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex items-center gap-2" role="group" aria-label="اشتراک‌گذاری نتیجه">
      {hasNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          aria-label="اشتراک‌گذاری"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v13"
            />
          </svg>
        </button>
      )}
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label="اشتراک‌گذاری در تلگرام"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.95 7.44l-1.96 9.26c-.15.67-.54.83-1.09.52l-3.01-2.22-1.45 1.39c-.16.16-.3.3-.62.3l.22-3.05 5.56-5.02c.24-.21-.05-.33-.37-.14L8.38 13.5l-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.83.95l-.01-.01z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label={copied ? 'کپی شد' : 'کپی لینک'}
      >
        {copied ? (
          <svg
            className="h-4 w-4 text-[var(--color-success)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}
