'use client';

import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import { isValidNationalId } from '@/shared/utils/validation';
import { ResultBadge, getCardTone, copyToClipboard } from './validation-utils';

export default function NationalIdValidator() {
  const { showToast } = useToast();
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState('');
  const [show, setShow] = useState(true);
  const [copied, setCopied] = useState(false);

  const ok = useMemo(() => (value ? isValidNationalId(value) : false), [value]);

  const digitsOnly = (v: string) => v.replace(/\D+/g, '');
  const format = (v: string) => {
    const d = digitsOnly(v).slice(0, 10);
    if (d.length <= 3) {
      return d;
    }
    if (d.length <= 6) {
      return `${d.slice(0, 3)}-${d.slice(3)}`;
    }
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  };

  return (
    <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(value, ok)}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-[var(--text-primary)]">کد ملی</div>
        {value ? <ResultBadge ok={ok} text={ok ? 'معتبر' : 'نامعتبر'} /> : null}
      </div>
      <Input
        label="کد ملی ۱۰ رقمی"
        type={show ? 'text' : 'password'}
        value={show ? format(value) : digitsOnly(value)}
        onChange={(e) => setValue(digitsOnly(e.target.value))}
        dir="ltr"
        placeholder="0010350829"
        inputMode="numeric"
        ref={ref}
        {...(value && !ok ? { error: 'کد ملی وارد شده معتبر نیست.' } : {})}
        endAction={
          <button
            type="button"
            className="text-xs font-semibold text-[var(--text-muted)]"
            onClick={() => setShow((prev) => !prev)}
          >
            {show ? 'مخفی' : 'نمایش'}
          </button>
        }
      />
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>فرمت استاندارد: ۱۲۳-۴۵۶-۷۸۹۰</span>
        <button
          type="button"
          className="font-semibold text-[var(--color-primary)]"
          onClick={() =>
            copyToClipboard(digitsOnly(value), 'nationalId', copied, setCopied, showToast)
          }
        >
          {copied ? 'کپی شد' : 'کپی مقدار'}
        </button>
      </div>
    </Card>
  );
}
