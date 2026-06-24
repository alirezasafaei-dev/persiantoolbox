'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';

type HiringResult = {
  baseSalary: number;
  insuranceEmployer: number;
  bonus: number;
  severance: number;
  foodAllowance: number;
  housingAllowance: number;
  totalMonthly: number;
  totalAnnual: number;
};

function calculateHiring(
  baseSalary: number,
  foodAllowance: number,
  housingAllowance: number,
  yearsOfService: number,
): HiringResult | null {
  if (baseSalary <= 0) {
    return null;
  }

  const insuranceEmployer = baseSalary * 0.23;
  const bonus = baseSalary / 12;
  const severance = (baseSalary / 12) * yearsOfService;

  const totalMonthly =
    baseSalary + insuranceEmployer + bonus + foodAllowance + housingAllowance;
  const totalAnnual = totalMonthly * 12;

  return {
    baseSalary,
    insuranceEmployer,
    bonus,
    severance,
    foodAllowance,
    housingAllowance,
    totalMonthly,
    totalAnnual,
  };
}

export default function HiringCostCalculator() {
  const [baseSalary, setBaseSalary] = useState('');
  const [foodAllowance, setFoodAllowance] = useState('');
  const [housingAllowance, setHousingAllowance] = useState('');
  const [yearsOfService, setYearsOfService] = useState('1');

  const baseNum = useMemo(() => parseFloat(baseSalary.replace(/,/g, '')) || 0, [baseSalary]);
  const foodNum = useMemo(() => parseFloat(foodAllowance.replace(/,/g, '')) || 0, [foodAllowance]);
  const housingNum = useMemo(
    () => parseFloat(housingAllowance.replace(/,/g, '')) || 0,
    [housingAllowance],
  );
  const yearsNum = parseInt(yearsOfService) || 1;

  const result = useMemo(
    () => calculateHiring(baseNum, foodNum, housingNum, yearsNum),
    [baseNum, foodNum, housingNum, yearsNum],
  );

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
            محاسبه هزینه واقعی استخدام
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            محاسبه هزینه کل استخدام کارگر شامل بیمه، عیدانه، سنوات و مزایای قانونی بر اساس قانون کار ۱۴۰۵
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              بیمه کارفرما ۲۳٪
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              عیدانه و سنوات
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              قانون کار ۱۴۰۵
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات استخدام</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="hc-salary" className="text-sm text-[var(--text-muted)]">
                حقوق پایه ماهانه (تومان)
              </label>
              <input
                id="hc-salary"
                type="text"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                placeholder="مثال: ۱۵,۰۶۶,۹۰۴ (حداقل حقوق ۱۴۰۵)"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="حقوق پایه"
              />
            </div>
            <div>
              <label htmlFor="hc-food" className="text-sm text-[var(--text-muted)]">
                حق غذا (تومان)
              </label>
              <input
                id="hc-food"
                type="text"
                value={foodAllowance}
                onChange={(e) => setFoodAllowance(e.target.value)}
                placeholder="اختیاری"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="حق غذا"
              />
            </div>
            <div>
              <label htmlFor="hc-housing" className="text-sm text-[var(--text-muted)]">
                حق مسکن (تومان)
              </label>
              <input
                id="hc-housing"
                type="text"
                value={housingAllowance}
                onChange={(e) => setHousingAllowance(e.target.value)}
                placeholder="اختیاری"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="حق مسکن"
              />
            </div>
            <div>
              <label htmlFor="hc-years" className="text-sm text-[var(--text-muted)]">
                سابقه خدمت (سال)
              </label>
              <input
                id="hc-years"
                type="number"
                min={0}
                max={35}
                value={yearsOfService}
                onChange={(e) => setYearsOfService(e.target.value)}
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="سابقه خدمت"
              />
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
            سهم بیمه کارفرما: ۲۳٪ از حقوق مشمول بیمه (شامل بازنشستگی، بیکاری و بیمه تکمیلی)
          </div>
        </Card>

        {result && (
          <Card
            className="p-6 space-y-3"
            role="region"
            aria-live="polite"
            aria-label="نتیجه محاسبه هزینه استخدام"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              جزئیات هزینه ماهانه
            </h2>
            <ResultRow label="حقوق پایه" value={formatMoneyFa(result.baseSalary)} />
            <ResultRow label="بیمه کارفرما (۲۳٪)" value={formatMoneyFa(result.insuranceEmployer)} />
            <ResultRow label="عیدانه (۱/۱۲ حقوق)" value={formatMoneyFa(result.bonus)} />
            <ResultRow label="حق سنوات (سالانه)" value={formatMoneyFa(result.severance)} />
            {result.foodAllowance > 0 && (
              <ResultRow label="حق غذا" value={formatMoneyFa(result.foodAllowance)} />
            )}
            {result.housingAllowance > 0 && (
              <ResultRow label="حق مسکن" value={formatMoneyFa(result.housingAllowance)} />
            )}
            <div className="pt-2">
              <ResultRow
                label="هزینه کل ماهانه"
                value={formatMoneyFa(result.totalMonthly)}
                highlight
              />
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  هزینه کل سالانه
                </span>
                <span className="text-lg font-bold text-[var(--color-success)]">
                  {formatMoneyFa(result.totalAnnual)} تومان
                </span>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
              ⚠️ این محاسبات صرفاً جهت اطلاع‌رسانی است و جایگزین قوانین رسمی کار نیست.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
