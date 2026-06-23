'use client';

import { useState } from 'react';

type Props = {
  from?: string;
  to?: string;
  onChange?: (range: { from: string; to: string }) => void;
};

export default function DateRangePicker({ from: fromProp = '', to: toProp = '', onChange }: Props) {
  const [from, setFrom] = useState(fromProp);
  const [to, setTo] = useState(toProp);

  const handleChange = (field: 'from' | 'to', value: string) => {
    const next = field === 'from' ? { from: value, to } : { from, to: value };
    if (field === 'from') {
      setFrom(value);
    } else {
      setTo(value);
    }
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-[var(--text-muted)]">از:</label>
      <input
        type="date"
        value={from}
        dir="ltr"
        onChange={(e) => handleChange('from', e.target.value)}
        className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
      />
      <label className="text-xs text-[var(--text-muted)]">تا:</label>
      <input
        type="date"
        value={to}
        dir="ltr"
        onChange={(e) => handleChange('to', e.target.value)}
        className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
      />
    </div>
  );
}
