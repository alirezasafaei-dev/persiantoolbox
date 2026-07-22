'use client';

import { useState } from 'react';
import { siteUrl } from '@/lib/seo';
import type { ToolEntry } from '@/lib/tools-registry';

type Props = {
  tool: ToolEntry;
};

export default function ToolEmbedCode({ tool }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const embedUrl = `${siteUrl}${tool.path}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" loading="lazy" title="${tool.title.replace(' - جعبه ابزار فارسی', '')}"></iframe>`;
  const linkCode = `<a href="${embedUrl}" target="_blank" rel="noopener noreferrer">${tool.title.replace(' - جعبه ابزار فارسی', '')} — جعبه ابزار فارسی</a>`;

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-[var(--text-primary)]"
      >
        <span>قرار دادن ابزار در سایت شما</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            این ابزار را در سایت یا وبلاگ خود قرار دهید. بازدیدکنندگان مستقیماً از سایت شما استفاده
            می‌کنند.
          </p>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">کد iframe</span>
              <button
                type="button"
                onClick={() => copyCode(iframeCode)}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                {copied ? 'کپی شد' : 'کپی'}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-[var(--radius-sm)] bg-[var(--surface-2)] p-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
              {iframeCode}
            </pre>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">لینک مستقیم</span>
              <button
                type="button"
                onClick={() => copyCode(linkCode)}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                {copied ? 'کپی شد' : 'کپی'}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-[var(--radius-sm)] bg-[var(--surface-2)] p-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
              {linkCode}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
