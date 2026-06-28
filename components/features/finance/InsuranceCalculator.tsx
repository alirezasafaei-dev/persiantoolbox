'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';
import SaveScenarioButton from '@/shared/ui/SaveScenarioButton';

type InsuranceResult = {
  grossSalary: number;
  insuranceBase: number;
  employee: {
    socialInsurance: number;
    unemployment: number;
    total: number;
  };
  employer: {
    socialInsurance: number;
    unemployment: number;
    total: number;
  };
  totalCost: number;
};

const INSURANCE_RATES = {
  socialInsurance: 0.23,
  unemployment: 0.03,
};

function calculateInsurance(grossSalary: number, benefits: number): InsuranceResult | null {
  if (grossSalary <= 0) {
    return null;
  }

  const totalIncome = grossSalary + benefits;
  const insuranceBase = Math.min(totalIncome, grossSalary * 3);

  const employeeSocial = insuranceBase * INSURANCE_RATES.socialInsurance;
  const employeeUnemployment = insuranceBase * INSURANCE_RATES.unemployment;
  const employeeTotal = employeeSocial + employeeUnemployment;

  const employerSocial = insuranceBase * INSURANCE_RATES.socialInsurance;
  const employerUnemployment = insuranceBase * INSURANCE_RATES.unemployment;
  const employerTotal = employerSocial + employerUnemployment;

  return {
    grossSalary: totalIncome,
    insuranceBase,
    employee: {
      socialInsurance: employeeSocial,
      unemployment: employeeUnemployment,
      total: employeeTotal,
    },
    employer: {
      socialInsurance: employerSocial,
      unemployment: employerUnemployment,
      total: employerTotal,
    },
    totalCost: employeeTotal + employerTotal,
  };
}

export default function InsuranceCalculator() {
  const [salary, setSalary] = useState('');
  const [benefits, setBenefits] = useState('');

  const gross = useMemo(() => parseFloat(salary.replace(/,/g, '')) || 0, [salary]);
  const ben = useMemo(() => parseFloat(benefits.replace(/,/g, '')) || 0, [benefits]);
  const result = useMemo(() => calculateInsurance(gross, ben), [gross, ben]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">محاسبه بیمه</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="ins-salary"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              حقوق پایه (تومان)
            </label>
            <input
              id="ins-salary"
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
              htmlFor="ins-benefits"
              className="block text-sm font-semibold text-[var(--text-secondary)] mb-1"
            >
              مزایا (تومان)
            </label>
            <input
              id="ins-benefits"
              type="text"
              inputMode="numeric"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="مثال: ۲,۰۰۰,۰۰۰"
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
            <h3 className="text-base font-bold text-[var(--text-primary)]">سهم کارگر</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">بیمه تأمین اجتماعی (۲۳٪)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.employee.socialInsurance)} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">بیمه بیکاری (۳٪)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.employee.unemployment)} تومان
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-light)] pt-2">
                <span className="font-bold text-[var(--text-primary)]">جمع سهم کارگر</span>
                <span className="font-bold text-[var(--color-danger)]">
                  {formatMoneyFa(result.employee.total)} تومان
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)]">سهم کارفرما</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">بیمه تأمین اجتماعی (۲۳٪)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.employer.socialInsurance)} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">بیمه بیکاری (۳٪)</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoneyFa(result.employer.unemployment)} تومان
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-light)] pt-2">
                <span className="font-bold text-[var(--text-primary)]">جمع سهم کارفرما</span>
                <span className="font-bold text-[var(--color-danger)]">
                  {formatMoneyFa(result.employer.total)} تومان
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {result ? (
        <Card className="p-6">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <span className="font-bold text-[var(--text-primary)]">هزینه کل بیمه ماهانه</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-[var(--color-primary)]">
                {formatMoneyFa(result.totalCost)} تومان
              </span>
              <SaveScenarioButton
                tool="insurance-calculator"
                title={`بیمه حقوق ${formatMoneyFa(gross)}`}
                summary={`سهم کارگر: ${formatMoneyFa(result.employee.total)} | سهم کارفرما: ${formatMoneyFa(result.employer.total)} | جمع: ${formatMoneyFa(result.totalCost)}`}
                input={{ grossSalary: gross }}
                output={result}
                disabled={gross <= 0}
              />
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
