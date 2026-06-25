'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';
import SaveScenarioButton from '@/shared/ui/SaveScenarioButton';

type BonusResult = {
  monthlySalary: number;
  annualBonus: number;
  annualBonusWithBenefits: number;
  newYearBonus: number;
  mealAllowance: number;
  totalAnnualExtra: number;
};

function calculateBonus(
  monthlySalary: number,
  benefits: number,
  yearsOfService: number,
): BonusResult | null {
  if (monthlySalary <= 0) {
    return null;
  }

  const annualBonus = monthlySalary;
  const annualBonusWithBenefits = (monthlySalary + benefits) * 1;
  const newYearBonus = (monthlySalary * Math.min(yearsOfService, 8)) / 8;
  const mealAllowance = monthlySalary * 0.1;

  const totalAnnualExtra = annualBonus + newYearBonus + mealAllowance * 12;

  return {
    monthlySalary,
    annualBonus,
    annualBonusWithBenefits,
    newYearBonus,
    mealAllowance,
    totalAnnualExtra,
  };
}

export default function BonusCalculator() {
  const [salary, setSalary] = useState('');
  const [benefits, setBenefits] = useState('');
  const [years, setYears] = useState('');

  const monthly = useMemo(() => parseFloat(salary.replace(/,/g, '')) || 0, [salary]);
  const ben = useMemo(() => parseFloat(benefits.replace(/,/g, '')) || 0, [benefits]);
  const yos = useMemo(() => parseInt(years) || 0, [years]);
  const result = useMemo(() => calculateBonus(monthly, ben, yos), [monthly, ben, yos]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">محاسبه عیدانه و پاداش</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="bonus-salary"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              حقوق ماهانه (تومان)
            </label>
            <input
              id="bonus-salary"
              type="text"
              inputMode="numeric"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="مثال: ۱۰,۰۰۰,۰۰۰"
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="bonus-benefits"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              مزایا (تومان)
            </label>
            <input
              id="bonus-benefits"
              type="text"
              inputMode="numeric"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="مثال: ۲,۰۰۰,۰۰۰"
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="bonus-years"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              سابقه خدمت (سال)
            </label>
            <input
              id="bonus-years"
              type="number"
              min="0"
              max="35"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="مثال: ۵"
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </Card>

      {result && (
        <div
          className="grid gap-4 md:grid-cols-2"
          role="region"
          aria-label="نتایج محاسبه"
          aria-live="polite"
        >
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              عیدانه و پاداش سالانه
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">عیدانه (یک ماه حقوق)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.annualBonus)} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">عیدانه با مزایا</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.annualBonusWithBenefits)} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">پاداش نوروزی</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.newYearBonus)} تومان
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">سایر مزایا</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]"> حق غذا (ماهانه)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.mealAllowance)} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">حق غذا (سالانه)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.mealAllowance * 12)} تومان
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {result && (
        <Card className="p-6">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <span className="font-bold text-[var(--text-primary)]">جمع مزایای سالانه</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-[var(--color-primary)]">
                {formatMoneyFa(result.totalAnnualExtra)} تومان
              </span>
              <SaveScenarioButton
                tool="bonus-calculator"
                title={`عیدی حقوق ${formatMoneyFa(monthly)}`}
                summary={`عیدی سالانه: ${formatMoneyFa(result.totalAnnualExtra)} | عیدی نوروز: ${formatMoneyFa(result.newYearBonus)}`}
                input={{ salary: monthly, benefits: ben, years: yos }}
                output={result}
                disabled={monthly <= 0}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
