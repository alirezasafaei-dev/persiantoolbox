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

  const toolUrl = `${siteUrl}${tool.path}`;
  const cleanTitle = tool.title.replace(' - جعبه ابزار فارسی', '');
  const linkCode = `<a href="${toolUrl}" target="_blank" rel="noopener noreferrer">${cleanTitle} — جعبه ابزار فارسی</a>`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-sm font-semibold text-[var(--text-primary)]"
        aria-expanded={open}
      >
        <span>معرفی این ابزار در سایت یا وبلاگ</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <p className="text-xs leading-6 text-[var(--text-muted)]">
            برای معرفی ابزار، این لینک attribution را در محتوای مرتبط قرار دهید. اجرای مستقیم ابزار
            داخل iframe فعلاً ارائه نمی‌شود تا سیاست‌های امنیتی صفحه اصلی حفظ شوند.
          </p>
          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[var(--text-secondary)]">کد لینک مستقیم</span>
              <button
                type="button"
                onClick={copyCode}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                {copied ? 'کپی شد' : 'کپی کد'}
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-sm)] bg-[var(--surface-2)] p-3 text-[10px] leading-relaxed text-[var(--text-muted)]">
              {linkCode}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
