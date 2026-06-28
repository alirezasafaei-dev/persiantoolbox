'use client';

import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { isValidIranianPlate } from '@/shared/utils/validation';
import { ResultBadge, getCardTone } from './validation-utils';

export default function PlateValidator() {
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState('');

  const ok = useMemo(() => (value ? isValidIranianPlate(value) : false), [value]);

  return (
    <Card className={`p-5 md:p-6 space-y-4 ${getCardTone(value, ok)}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-[var(--text-primary)]">پلاک خودرو</div>
        {value ? <ResultBadge ok={ok} text={ok ? 'معتبر' : 'نامعتبر'} /> : null}
      </div>
      <Input
        label="فرمت پلاک ایران"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        dir="ltr"
        placeholder="12ب34567"
        ref={ref}
        {...(value && !ok ? { error: 'پلاک وارد شده معتبر نیست.' } : {})}
      />
    </Card>
  );
}
