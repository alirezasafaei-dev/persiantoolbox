'use client';

import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import { isValidIranianMobile, normalizeIranianMobile } from '@/shared/utils/validation';
import { ResultBadge, getCardTone, copyToClipboard } from './validation-utils';

export default function MobileValidator() {
  const { showToast } = useToast();
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);

  const normalized = useMemo(() => normalizeIranianMobile(value), [value]);
  const ok = useMemo(() => (value ? isValidIranianMobile(value) : false), [value]);

  const digitsOnly = (v: string) => v.replace(/\D+/g, '');
  const format = (v: string) => {
    const d = digitsOnly(v).slice(0, 11);
    if (d.length <= 4) {
      return d;
    }
    if (d.length <= 7) {
      return `${d.slice(0, 4)} ${d.slice(4)}`;
    }
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  };

  return (
    <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(value, ok)}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-[var(--text-primary)]">شماره موبایل</div>
        {value ? <ResultBadge ok={ok} text={ok ? 'معتبر' : 'نامعتبر'} /> : null}
      </div>
      <Input
        label="موبایل ایران"
        value={format(value)}
        onChange={(e) => setValue(digitsOnly(e.target.value))}
        dir="ltr"
        placeholder="09123456789 یا +989123456789"
        inputMode="numeric"
        ref={ref}
        {...(value && !ok ? { error: 'شماره موبایل وارد شده معتبر نیست.' } : {})}
      />
      {normalized ? (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            نرمال‌شده: <span dir="ltr">{normalized}</span>
          </span>
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyToClipboard(normalized, 'mobile', copied, setCopied, showToast)}
          >
            کپی مقدار
          </button>
        </div>
      ) : null}
    </Card>
  );
}
