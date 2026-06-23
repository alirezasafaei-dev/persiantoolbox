'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

type TaxResult = {
  grossSalary: number;
  insuranceBase: number;
  insuranceEmployee: number;
  insuranceEmployer: number;
  taxFreeIncome: number;
  taxableIncome: number;
  taxAmount: number;
  netSalary: number;
  effectiveTaxRate: number;
};

function calculateTax(grossSalary: number, benefits: number): TaxResult {
  const INSURANCE_RATE = 0.07;
  const TAX_FREE_INCOME = 400_000_000;

  const totalIncome = grossSalary + benefits;
  const insuranceBase = Math.min(totalIncome, grossSalary * 3);
  const insuranceEmployee = insuranceBase * INSURANCE_RATE;

  const deductions = insuranceEmployee;

  const taxableIncome = Math.max(0, totalIncome - TAX_FREE_INCOME - deductions);

  const brackets = [
    { limit: 40_000_000, rate: 0 },
    { limit: 10_000_000, rate: 0.1 },
    { limit: 16_666_667, rate: 0.15 },
    { limit: 33_333_333, rate: 0.2 },
    { limit: 33_333_333, rate: 0.25 },
    { limit: Infinity, rate: 0.3 },
  ];

  let remaining = taxableIncome;
  let taxAmount = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) {
      break;
    }
    const taxable = Math.min(remaining, bracket.limit);
    taxAmount += taxable * bracket.rate;
    remaining -= taxable;
  }

  const netSalary = totalIncome - insuranceEmployee - taxAmount;
  const effectiveTaxRate = totalIncome > 0 ? (taxAmount / totalIncome) * 100 : 0;

  return {
    grossSalary,
    insuranceBase,
    insuranceEmployee,
    insuranceEmployer: insuranceBase * INSURANCE_RATE,
    taxFreeIncome: TAX_FREE_INCOME,
    taxableIncome,
    taxAmount,
    netSalary,
    effectiveTaxRate,
  };
}

export default function TaxCalculatorPage() {
  const [grossSalary, setGrossSalary] = useState('');
  const [benefits, setBenefits] = useState('');

  const gross = useMemo(() => parseFloat(grossSalary.replace(/,/g, '')) || 0, [grossSalary]);
  const ben = useMemo(() => parseFloat(benefits.replace(/,/g, '')) || 0, [benefits]);

  const result = useMemo(() => {
    if (gross <= 0) {
      return null;
    }
    return calculateTax(gross, ben);
  }, [gross, ben]);

  const ResultRow = ({
    label,
    value,
    highlight = false,
  }: {
    label: string;
    value: string;
    highlight?: boolean;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span
        className={`text-sm font-bold ${highlight ? 'text-[var(--color-success)] text-lg' : 'text-[var(--text-primary)]'}`}
      >
        {value} تومان
      </span>
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            محاسبه‌گر مالیات بر درآمد
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            مالیات بر درآمد حقوق سال ۱۴۰۵ را محاسبه کنید. معافیت مالیاتی: ۴۰۰ میلیون تومان.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              پردازش محلی
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              قوانین ۱۴۰۵
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              جدول پلکانی
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات ورودی</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="tax-gross" className="text-sm text-[var(--text-muted)]">
                حقوق ناخالص ماهانه (تومان)
              </label>
              <input
                id="tax-gross"
                type="text"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                placeholder="مثال: ۲۰,۰۰۰,۰۰۰"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="حقوق ناخالص"
              />
            </div>
            <div>
              <label htmlFor="tax-benefits" className="text-sm text-[var(--text-muted)]">
                مزایا و بن‌ها (تومان)
              </label>
              <input
                id="tax-benefits"
                type="text"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="اختیاری"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="مزایا"
              />
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
            💡 معافیت مالیاتی سالانه: ۴۰۰ میلیون تومان. نرخ بیمه تأمین اجتماعی: ۷٪
          </div>
        </Card>

        {result && (
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">نتیجه محاسبه</h2>
            <ResultRow label="حقوق ناخالص" value={formatMoney(result.grossSalary)} />
            <ResultRow label="حق بیمه کارگر (۷٪)" value={formatMoney(result.insuranceEmployee)} />
            <ResultRow label="معافیت مالیاتی" value={formatMoney(result.taxFreeIncome)} />
            <ResultRow label="درآمد مشمول مالیات" value={formatMoney(result.taxableIncome)} />
            <ResultRow label="مالیات" value={formatMoney(result.taxAmount)} />
            <div className="pt-2">
              <ResultRow label="حقوق خالص" value={formatMoney(result.netSalary)} highlight />
            </div>
            <div className="text-xs text-[var(--text-muted)] pt-2">
              نرخ مؤثر مالیات: {result.effectiveTaxRate.toFixed(1)}%
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
