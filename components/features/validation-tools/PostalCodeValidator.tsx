'use client';

import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import { toEnglishDigits } from '@/shared/utils/numbers/number';
import { isValidIranianPostalCode } from '@/shared/utils/validation';
import { ResultBadge, getCardTone, copyToClipboard } from './validation-utils';

export default function PostalCodeValidator() {
  const { showToast } = useToast();
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);

  const ok = useMemo(() => (value ? isValidIranianPostalCode(value) : false), [value]);

  const digitsOnly = (v: string) => toEnglishDigits(v).replace(/\D+/g, '');
  const format = (v: string) => {
    const d = digitsOnly(v).slice(0, 10);
    if (d.length <= 5) {
      return d;
    }
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-(--text-primary)">اعتبارسنجی کد پستی آنلاین</h1>
        <p className="text-sm leading-7 text-(--text-secondary)">
          این ابزار فقط ساختار کد پستی ۱۰ رقمی را بررسی می‌کند و جایگزین استعلام رسمی نشانی از شرکت
          پست نیست.
        </p>
      </div>
      <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(value, ok)}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-(--text-primary)">کد پستی</div>
          {value ? <ResultBadge ok={ok} text={ok ? 'معتبر' : 'نامعتبر'} /> : null}
        </div>
        <Input
          label="کدپستی ۱۰ رقمی"
          value={format(value)}
          onChange={(e) => setValue(digitsOnly(e.target.value))}
          dir="ltr"
          placeholder="1234567890"
          inputMode="numeric"
          ref={ref}
          {...(value && !ok ? { error: 'کد پستی وارد شده معتبر نیست.' } : {})}
        />
        <div className="flex items-center justify-between text-xs text-(--text-muted)">
          <span>فرمت استاندارد: ۱۲۳۴۵-۶۷۸۹۰</span>
          <button
            type="button"
            className="font-semibold text-primary"
            onClick={() =>
              copyToClipboard(digitsOnly(value), 'postal', copied, setCopied, showToast)
            }
          >
            {copied ? 'کپی شد' : 'کپی مقدار'}
          </button>
        </div>
      </Card>
    </div>
  );
}
