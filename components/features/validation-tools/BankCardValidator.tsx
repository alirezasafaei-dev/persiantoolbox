'use client';

import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import { isValidCardNumber } from '@/shared/utils/validation';
import { ResultBadge, getCardTone, copyToClipboard } from './validation-utils';

export default function BankCardValidator() {
  const { showToast } = useToast();
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState('');
  const [show, setShow] = useState(true);
  const [copied, setCopied] = useState(false);

  const ok = useMemo(() => (value ? isValidCardNumber(value) : false), [value]);

  const digitsOnly = (v: string) => v.replace(/\D+/g, '');
  const format = (v: string) => {
    const d = digitsOnly(v).slice(0, 16);
    return d.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  };

  return (
    <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(value, ok)}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-[var(--text-primary)]">کارت بانکی</div>
        {value && <ResultBadge ok={ok} text={ok ? 'معتبر' : 'نامعتبر'} />}
      </div>
      <Input
        label="شماره کارت ۱۶ رقمی"
        type={show ? 'text' : 'password'}
        value={show ? format(value) : digitsOnly(value)}
        onChange={(e) => setValue(digitsOnly(e.target.value))}
        dir="ltr"
        placeholder="6037-9918-9412-3456"
        inputMode="numeric"
        ref={ref}
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
        <span>فرمت استاندارد: ۶۰۳۷-۹۹۱۸-۹۴۱۲-۳۴۵۶</span>
        <button
          type="button"
          className="font-semibold text-[var(--color-primary)]"
          onClick={() => copyToClipboard(digitsOnly(value), 'card', copied, setCopied, showToast)}
        >
          {copied ? 'کپی شد' : 'کپی مقدار'}
        </button>
      </div>
    </Card>
  );
}
