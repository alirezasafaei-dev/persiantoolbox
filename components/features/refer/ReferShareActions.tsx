'use client';

import { useMemo, useState } from 'react';

const SITE_URL = 'https://persiantoolbox.ir/';

export default function ReferShareActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  const shareText = useMemo(
    () => 'جعبه ابزار فارسی را ببینید: ابزارهای کاربردی سریع و امن برای کاربران فارسی‌زبان',
    [],
  );

  async function handleCopyLink() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard-not-available');
      }
      await navigator.clipboard.writeText(SITE_URL);
      setCopyState('success');
    } catch {
      setCopyState('error');
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="btn btn-primary btn-md"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="refer-options"
      >
        معرفی به دوستان
      </button>

      {isOpen ? (
        <div
          id="refer-options"
          className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4"
        >
          <button
            type="button"
            className="btn btn-secondary btn-md justify-center"
            onClick={handleCopyLink}
          >
            کپی لینک سایت
          </button>

          <a
            href={`sms:?&body=${encodeURIComponent(`${shareText}\n${SITE_URL}`)}`}
            className="btn btn-secondary btn-md justify-center"
          >
            ارسال لینک از طریق پیامک
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(
              shareText,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-md justify-center"
          >
            ارسال لینک در تلگرام
          </a>

          {copyState === 'success' ? (
            <p className="text-xs text-[var(--color-success)]">لینک سایت کپی شد.</p>
          ) : null}
          {copyState === 'error' ? (
            <p className="text-xs text-[var(--color-danger)]">
              کپی خودکار در دسترس نیست. لینک را دستی کپی کنید: {SITE_URL}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
