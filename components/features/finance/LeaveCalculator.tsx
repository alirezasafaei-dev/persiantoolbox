'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';
import SaveScenarioButton from '@/shared/ui/SaveScenarioButton';

type LeaveResult = {
  annualLeave: number;
  usedLeave: number;
  remainingLeave: number;
  sickLeave: number;
  marriageLeave: number;
  bereavementLeave: number;
  dailySalary: number;
  leaveValue: number;
};

function calculateLeave(
  monthlySalary: number,
  yearsOfService: number,
  usedLeaveDays: number,
): LeaveResult | null {
  if (monthlySalary <= 0) {
    return null;
  }

  const annualLeave = Math.min(26, 15 + Math.floor(yearsOfService / 4));
  const remainingLeave = Math.max(0, annualLeave - usedLeaveDays);
  const sickLeave = 20;
  const marriageLeave = 3;
  const bereavementLeave = 5;
  const dailySalary = monthlySalary / 30;
  const leaveValue = dailySalary * remainingLeave;

  return {
    annualLeave,
    usedLeave: usedLeaveDays,
    remainingLeave,
    sickLeave,
    marriageLeave,
    bereavementLeave,
    dailySalary,
    leaveValue,
  };
}

export default function LeaveCalculator() {
  const [salary, setSalary] = useState('');
  const [years, setYears] = useState('');
  const [usedDays, setUsedDays] = useState('');

  const sal = useMemo(() => parseFloat(salary.replace(/,/g, '')) || 0, [salary]);
  const y = useMemo(() => parseInt(years) || 0, [years]);
  const u = useMemo(() => parseInt(usedDays) || 0, [usedDays]);
  const result = useMemo(() => calculateLeave(sal, y, u), [sal, y, u]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">محاسبه مرخصی</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="leave-salary"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              حقوق ماهانه (تومان)
            </label>
            <input
              id="leave-salary"
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
              htmlFor="leave-years"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              سابقه خدمت (سال)
            </label>
            <input
              id="leave-years"
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
              htmlFor="leave-used"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              روزهای استفاده شده
            </label>
            <input
              id="leave-used"
              type="number"
              min="0"
              max="365"
              value={usedDays}
              onChange={(e) => setUsedDays(e.target.value)}
              placeholder="مثال: ۱۰"
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
            <h3 className="text-base font-bold text-[var(--text-primary)]">مرخصی استحقاقی</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">مرخصی سالانه</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {result.annualLeave} روز
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">استفاده شده</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {result.usedLeave} روز
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-light)] pt-2">
                <span className="font-bold text-[var(--text-primary)]">باقیمانده</span>
                <span className="font-bold text-[var(--color-primary)]">
                  {result.remainingLeave} روز
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">سایر مرخصی‌ها</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">مرخصی استعلاجی</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {result.sickLeave} روز
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">مرخصی ازدواج</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {result.marriageLeave} روز
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">مرخصی عزاداری</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {result.bereavementLeave} روز
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {result ? (
        <Card className="p-6">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <span className="font-bold text-[var(--text-primary)]">ارزش مالی مرخصی باقیمانده</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-[var(--color-primary)]">
                {formatMoneyFa(result.leaveValue)} تومان
              </span>
              <SaveScenarioButton
                tool="leave-calculator"
                title={`مرخصی ${result.remainingLeave} روز`}
                summary={`مرخصی باقیمانده: ${result.remainingLeave} روز | ارزش: ${formatMoneyFa(result.leaveValue)}`}
                input={{ salary: sal, years: y, usedLeave: u }}
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
