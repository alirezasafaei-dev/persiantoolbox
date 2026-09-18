'use client';

import SavedFinanceCalculations from '@/components/features/finance/SavedFinanceCalculations';
import { useMemo, useState } from 'react';
import { calculateInterestResult, type InterestMode } from '@/features/interest/interest.logic';
import { saveFinanceCalculation } from '@/shared/analytics/financeSaved';
import { formatMoneyFa, parseLooseNumber } from '@/shared/utils/numbers';

type InterestFormState = {
  principalText: string;
  annualRateText: string;
  monthsText: string;
  mode: InterestMode;
};

export default function InterestPage() {
  const [form, setForm] = useState<InterestFormState>({
    principalText: '100000000',
    annualRateText: '20',
    monthsText: '12',
    mode: 'simple',
  });
  const calculation = useMemo(() => {
    const principal = parseLooseNumber(form.principalText);
    const annualRatePercent = parseLooseNumber(form.annualRateText);
    const months = parseLooseNumber(form.monthsText);

    return calculateInterestResult({
      principal: principal ?? 0,
      annualRatePercent: annualRatePercent ?? 0,
      months: Math.trunc(months ?? 0),
      mode: form.mode,
    });
  }, [form]);

  const error = calculation.ok ? null : calculation.error.message;
  const result = calculation.ok ? calculation.data : null;

  const handleSave = () => {
    if (!result) {
      return;
    }
    saveFinanceCalculation({
      tool: 'interest',
      title: 'سناریوی سود سپرده',
      summary: `سود کل: ${formatMoneyFa(result.interest)} تومان | مبلغ نهایی: ${formatMoneyFa(
        result.finalAmount,
      )} تومان`,
    });
  };

  return (
    <div className="space-y-8">
      <section className="section-surface rounded-lg border border-(--border-light) p-6 md:p-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-(--text-primary) md:text-4xl">
            محاسبه‌گر سود سپرده بانکی
          </h1>
          <p className="text-(--text-secondary) leading-7">
            سود کل، مبلغ نهایی و سود ماهانه تقریبی را با واحد تومان محاسبه کنید. پردازش کامل به‌صورت
            محلی در مرورگر انجام می‌شود.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-(--border-light) bg-(--surface-1) p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-(--text-primary)">
            مبلغ سپرده (تومان)
            <input
              type="text"
              className="input-field"
              value={form.principalText}
              onChange={(event) => setForm((s) => ({ ...s, principalText: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-(--text-primary)">
            نرخ سود سالانه (درصد)
            <input
              type="text"
              className="input-field"
              value={form.annualRateText}
              onChange={(event) => setForm((s) => ({ ...s, annualRateText: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-(--text-primary)">
            مدت (ماه)
            <input
              type="text"
              className="input-field"
              value={form.monthsText}
              onChange={(event) => setForm((s) => ({ ...s, monthsText: event.target.value }))}
            />
          </label>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-(--text-primary)">حالت محاسبه</div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={form.mode === 'simple'}
                onClick={() => setForm((s) => ({ ...s, mode: 'simple' }))}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  form.mode === 'simple'
                    ? 'bg-primary text-(--text-inverted)'
                    : 'border border-(--border-light) text-(--text-primary)'
                }`}
              >
                ساده
              </button>
              <button
                type="button"
                aria-pressed={form.mode === 'compound'}
                onClick={() => setForm((s) => ({ ...s, mode: 'compound' }))}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  form.mode === 'compound'
                    ? 'bg-primary text-(--text-inverted)'
                    : 'border border-(--border-light) text-(--text-primary)'
                }`}
              >
                مرکب
              </button>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.12)] px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </div>
      ) : null}

      {result ? (
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5">
              <h2 className="text-sm font-semibold text-(--text-muted)">سود کل</h2>
              <p className="mt-3 text-2xl font-black text-(--text-primary)">
                {formatMoneyFa(result.interest)} تومان
              </p>
            </article>
            <article className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5">
              <h2 className="text-sm font-semibold text-(--text-muted)">مبلغ نهایی</h2>
              <p className="mt-3 text-2xl font-black text-(--text-primary)">
                {formatMoneyFa(result.finalAmount)} تومان
              </p>
            </article>
            <article className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5">
              <h2 className="text-sm font-semibold text-(--text-muted)">سود ماهانه تقریبی</h2>
              <p className="mt-3 text-2xl font-black text-(--text-primary)">
                {formatMoneyFa(result.monthlyProfit)} تومان
              </p>
            </article>
          </div>
          <button type="button" className="btn btn-primary btn-md" onClick={handleSave}>
            ذخیره محاسبه در مرورگر
          </button>
        </section>
      ) : null}
      <SavedFinanceCalculations tool="interest" />
    </div>
  );
}
