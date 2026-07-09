'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';
import { formatMoneyFa } from '@/shared/utils';
import ShareResult from '@/components/ui/ShareResult';

type VatMode = 'exclusive' | 'inclusive';

type VatResult = {
  baseAmount: number;
  vatAmount: number;
  totalAmount: number;
  rate: number;
};

function calculateVat(baseAmount: number, rate: number, mode: VatMode): VatResult | null {
  if (baseAmount <= 0 || rate <= 0) {
    return null;
  }

  if (mode === 'exclusive') {
    const vatAmount = baseAmount * (rate / 100);
    return {
      baseAmount,
      vatAmount,
      totalAmount: baseAmount + vatAmount,
      rate,
    };
  }

  const totalAmount = baseAmount;
  const base = totalAmount / (1 + rate / 100);
  const vatAmount = totalAmount - base;
  return {
    baseAmount: base,
    vatAmount,
    totalAmount,
    rate,
  };
}

const VAT_RATES = [7, 9, 10, 12] as const;

export default function VatCalculator() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('9');
  const [mode, setMode] = useState<VatMode>('exclusive');

  const amountNum = useMemo(() => parseFloat(amount.replace(/,/g, '')) || 0, [amount]);
  const rateNum = parseFloat(rate) || 0;

  const result = useMemo(() => calculateVat(amountNum, rateNum, mode), [amountNum, rateNum, mode]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            محاسبه مالیات بر ارزش افزوده
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            محاسبه مالیات بر ارزش افزوده با نرخ‌های ۷٪، ۹٪، ۱۰٪ و ۱۲٪ مطابق بودجه ۱۴۰۵
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              نرخ‌های ۱۴۰۵
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              محاسبه مستقیم و معکوس
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات ورودی</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="vat-amount" className="text-sm text-[var(--text-muted)]">
                {mode === 'exclusive' ? 'مبلغ پایه (تومان)' : 'مبلغ کل شامل مالیات (تومان)'}
              </label>
              <input
                id="vat-amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثال: ۱۰,۰۰۰,۰۰۰"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="مبلغ"
              />
            </div>

            <div>
              <label className="text-sm text-[var(--text-muted)]">نرخ مالیات بر ارزش افزوده</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {VAT_RATES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRate(String(r))}
                    className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                      rate === String(r)
                        ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                        : 'bg-[var(--surface-1)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--color-primary)]'
                    }`}
                    aria-label={`نرخ ${r} درصد`}
                  >
                    {r}٪
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--text-muted)]">نوع محاسبه</label>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setMode('exclusive')}
                  aria-pressed={mode === 'exclusive'}
                  className={`flex-1 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                    mode === 'exclusive'
                      ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                      : 'bg-[var(--surface-1)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  افزودن مالیات
                </button>
                <button
                  type="button"
                  onClick={() => setMode('inclusive')}
                  aria-pressed={mode === 'inclusive'}
                  className={`flex-1 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                    mode === 'inclusive'
                      ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                      : 'bg-[var(--surface-1)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  جدا کردن مالیات
                </button>
              </div>
            </div>
          </div>
        </Card>

        {result ? (
          <Card
            className="p-6 space-y-3"
            role="region"
            aria-live="polite"
            aria-label="نتیجه محاسبه مالیات بر ارزش افزوده"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">نتیجه محاسبه</h2>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">مبلغ پایه (بدون مالیات)</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatMoneyFa(result.baseAmount)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">
                مالیات بر ارزش افزوده ({result.rate}٪)
              </span>
              <span className="text-sm font-bold text-[var(--color-success)]">
                {formatMoneyFa(result.vatAmount)} تومان
              </span>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  مبلغ کل (شامل مالیات)
                </span>
                <span className="text-lg font-bold text-[var(--color-success)]">
                  {formatMoneyFa(result.totalAmount)} تومان
                </span>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
              ⚠️ این محاسبات صرفاً جهت اطلاع‌رسانی است و جایگزین قوانین رسمی مالیاتی نیست.
            </div>
            <ShareResult
              title="محاسبه مالیات بر ارزش افزوده"
              text={`مالیات: ${formatMoneyFa(result.vatAmount)} تومان (${result.rate}٪) | مبلغ کل: ${formatMoneyFa(result.totalAmount)} تومان`}
            />
          </Card>
        ) : null}
      </div>

      <FinancialTransparencyBox
        calculationName="شفافیت محاسبه مالیات بر ارزش افزوده"
        formulaSummary="مالیات = مبلغ پایه × نرخ مالیات"
        legalBasis="قانون مالیات بر ارزش افزوده - بودجه سال ۱۴۰۵"
        dataSource="سازمان امور مالیاتی کشور"
        lastUpdated="۱۴۰۵"
      />
    </div>
  );
}
