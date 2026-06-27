import type { Dispatch, SetStateAction } from 'react';

export const ResultBadge = ({ ok, text }: { ok: boolean; text: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      ok
        ? 'bg-[rgb(var(--color-success-rgb)/0.16)] text-[var(--color-success)]'
        : 'bg-[rgb(var(--color-danger-rgb)/0.12)] text-[var(--color-danger)]'
    }`}
  >
    {text}
  </span>
);

export const getCardTone = (value: string, ok: boolean) => {
  if (!value) {
    return '';
  }
  return ok
    ? 'bg-[rgb(var(--color-success-rgb)/0.08)] border-[rgb(var(--color-success-rgb)/0.3)]'
    : 'bg-[rgb(var(--color-danger-rgb)/0.08)] border-[rgb(var(--color-danger-rgb)/0.3)]';
};

export const copyToClipboard = async (
  value: string,
  _field: string,
  _currentCopied: boolean,
  setCopied: Dispatch<SetStateAction<boolean>>,
  showToast: (msg: string, type: 'success' | 'error') => void,
) => {
  const text = value.trim();
  if (!text) {
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    setCopied(true);
    showToast('کپی شد', 'success');
    setTimeout(() => setCopied(false), 2000);
  } catch {
    setCopied(false);
    showToast('کپی انجام نشد', 'error');
  }
};
