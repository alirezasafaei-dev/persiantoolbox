'use client';

import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import { isValidIranianSheba } from '@/shared/utils/validation';
import { ResultBadge, getCardTone, copyToClipboard } from './validation-utils';

export default function ShebaValidator() {
  const { showToast } = useToast();
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState('');
  const [show, setShow] = useState(true);
  const [copied, setCopied] = useState(false);

  const ok = useMemo(() => (value ? isValidIranianSheba(value) : false), [value]);

  const format = (v: string) => {
    const cleaned = v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const normalized = cleaned.startsWith('IR') ? cleaned : `IR${cleaned.replace(/^IR/i, '')}`;
    const trimmed = normalized.slice(0, 26);
    const prefix = trimmed.slice(0, 4);
    const rest = trimmed
      .slice(4)
      .replace(/(.{4})/g, '$1 ')
      .trim();
    return rest ? `${prefix} ${rest}` : prefix;
  };

  return (
    <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(value, ok)}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-[var(--text-primary)]">شماره شبا</div>
        {value && <ResultBadge ok={ok} text={ok ? 'معتبر' : 'نامعتبر'} />}
      </div>
      <Input
        label="شبا (IR)"
        type={show ? 'text' : 'password'}
        value={show ? format(value) : value.replace(/\s+/g, '')}
        onChange={(e) => setValue(e.target.value.replace(/\s+/g, ''))}
        dir="ltr"
        placeholder="IR062960000000100324200001"
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
        <span>فرمت استاندارد: IRxx xxxx xxxx xxxx xxxx xxxx xx</span>
        <button
          type="button"
          className="font-semibold text-[var(--color-primary)]"
          onClick={() =>
            copyToClipboard(value.replace(/\s+/g, ''), 'sheba', copied, setCopied, showToast)
          }
        >
          {copied ? 'کپی شد' : 'کپی مقدار'}
        </button>
      </div>
    </Card>
  );
}
