'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';
import SaveScenarioButton from '@/shared/ui/SaveScenarioButton';

type SeveranceResult = {
  lastSalary: number;
  yearsOfService: number;
  monthsWorked: number;
  severancePay: number;
  leavePay: number;
  total: number;
};

function calculateSeverance(
  lastMonthlySalary: number,
  yearsOfService: number,
  monthsWorked: number,
  unusedLeaveDays: number,
): SeveranceResult | null {
  if (lastMonthlySalary <= 0) {
    return null;
  }

  const totalMonths = yearsOfService * 12 + monthsWorked;
  const severancePay = (lastMonthlySalary / 30) * totalMonths;
  const dailySalary = lastMonthlySalary / 30;
  const leavePay = dailySalary * unusedLeaveDays;
  const total = severancePay + leavePay;

  return {
    lastSalary: lastMonthlySalary,
    yearsOfService,
    monthsWorked,
    severancePay,
    leavePay,
    total,
  };
}

export default function SeveranceCalculator() {
  const [salary, setSalary] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [leaveDays, setLeaveDays] = useState('');

  const sal = useMemo(() => parseFloat(salary.replace(/,/g, '')) || 0, [salary]);
  const y = useMemo(() => parseInt(years) || 0, [years]);
  const m = useMemo(() => parseInt(months) || 0, [months]);
  const ld = useMemo(() => parseInt(leaveDays) || 0, [leaveDays]);
  const result = useMemo(() => calculateSeverance(sal, y, m, ld), [sal, y, m, ld]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">محاسبه حق سنوات و مرخصی</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="sev-salary"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              آخرین حقوق ماهانه (تومان)
            </label>
            <input
              id="sev-salary"
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
              htmlFor="sev-years"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              سابقه خدمت (سال)
            </label>
            <input
              id="sev-years"
              type="number"
              min="0"
              max="35"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="مثال: ۵"
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="sev-months"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              ماه‌های اضافی
            </label>
            <input
              id="sev-months"
              type="number"
              min="0"
              max="11"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="مثال: ۳"
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label
              htmlFor="sev-leave"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              روزهای مرخصی استفاده نشده
            </label>
            <input
              id="sev-leave"
              type="number"
              min="0"
              value={leaveDays}
              onChange={(e) => setLeaveDays(e.target.value)}
              placeholder="مثال: ۱۵"
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </Card>

      {result ? (
        <div
          className="grid gap-4 md:grid-cols-2"
          role="region"
          aria-label="نتایج محاسبه"
          aria-live="polite"
        >
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">حق سنوات</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">سابقه کل</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {result.yearsOfService} سال و {result.monthsWorked} ماه
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">حق سنوات</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {formatMoneyFa(result.severancePay)} تومان
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">مرخصی استفاده نشده</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">روزهای باقیمانده</span>
                <span className="font-semibold text-[var(--text-primary)]">{ld} روز</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">حق مرخصی</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {formatMoneyFa(result.leavePay)} تومان
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {result ? (
        <Card className="p-6">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <span className="font-bold text-[var(--text-primary)]">جمع کل قابل پرداخت</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-[var(--color-primary)]">
                {formatMoneyFa(result.total)} تومان
              </span>
              <SaveScenarioButton
                tool="severance-calculator"
                title={`سنوات ${y} سال`}
                summary={`سنوات: ${formatMoneyFa(result.severancePay)} | مرخصی: ${formatMoneyFa(result.leavePay)} | جمع: ${formatMoneyFa(result.total)}`}
                input={{ salary: sal, years: y, months: m, leaveDays: ld }}
                output={result}
                disabled={sal <= 0}
              />
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
