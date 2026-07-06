'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';

type BankRate = {
  name: string;
  shortTerm: number;
  midTerm: number;
  longTerm: number;
};

const DEFAULT_RATES: BankRate[] = [
  { name: 'بانک ملی', shortTerm: 23, midTerm: 26, longTerm: 28 },
  { name: 'بانک ملت', shortTerm: 23, midTerm: 26, longTerm: 28 },
  { name: 'بانک صادرات', shortTerm: 23, midTerm: 26, longTerm: 28 },
  { name: 'بانک تجارت', shortTerm: 23, midTerm: 26, longTerm: 28 },
  { name: 'بانک رفاه', shortTerm: 23, midTerm: 26, longTerm: 28 },
  { name: 'بانک سپه', shortTerm: 23, midTerm: 26, longTerm: 28 },
  { name: 'پست‌بانک', shortTerm: 23, midTerm: 26, longTerm: 28 },
  { name: 'بانک کشاورزی', shortTerm: 23, midTerm: 26, longTerm: 28 },
];

function getRate(bank: (typeof DEFAULT_RATES)[number], duration: 'short' | 'mid' | 'long'): number {
  if (duration === 'short') {
    return bank.shortTerm;
  }
  if (duration === 'mid') {
    return bank.midTerm;
  }
  return bank.longTerm;
}

export default function BankRateComparatorPage() {
  const [depositAmount, setDepositAmount] = useState('100000000');
  const [duration, setDuration] = useState<'short' | 'mid' | 'long'>('long');
  const _rates = DEFAULT_RATES;

  const amount = useMemo(() => parseFloat(depositAmount.replace(/,/g, '')) || 0, [depositAmount]);

  const sorted = useMemo(() => {
    return [..._rates].sort((a, b) => {
      const rateA = getRate(a, duration);
      const rateB = getRate(b, duration);
      return rateB - rateA;
    });
  }, [_rates, duration]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-warning-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            مقایسه نرخ سود بانک‌ها
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            نرخ سود سپرده بانک‌های دولتی و خصوصی را مقایسه کنید و بهترین گزینه را پیدا کنید.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="bank-amount" className="text-sm text-[var(--text-muted)]">
            مبلغ سپرده (تومان)
          </label>
          <input
            id="bank-amount"
            type="text"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label="مبلغ سپرده"
          />
        </div>
        <div className="flex gap-2 items-end">
          {[
            { value: 'short' as const, label: 'کوتاه‌مدت' },
            { value: 'mid' as const, label: 'میان‌مدت' },
            { value: 'long' as const, label: 'بلندمدت' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDuration(opt.value)}
              aria-pressed={duration === opt.value}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${duration === opt.value ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((bank, index) => {
          const rate = getRate(bank, duration);
          const yearlyInterest = amount * (rate / 100);
          const monthlyInterest = yearlyInterest / 12;
          return (
            <Card
              key={bank.name}
              className={`p-4 space-y-2 ${index === 0 ? 'border-[var(--color-success)]/50 bg-[rgb(var(--color-success-rgb)/0.05)]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{bank.name}</h3>
                {index === 0 && (
                  <span className="text-xs bg-[var(--color-success)] text-white px-2 py-0.5 rounded-full">
                    بهترین
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-[var(--color-primary)]">{rate}%</div>
              <div className="text-xs text-[var(--text-muted)]">
                سود ماهانه: {formatMoneyFa(monthlyInterest)} تومان
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                سود سالانه: {formatMoneyFa(yearlyInterest)} تومان
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
