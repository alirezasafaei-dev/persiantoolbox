'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';
import SaveScenarioButton from '@/shared/ui/SaveScenarioButton';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

type Result = {
  monthlyPension: number;
  totalContributions: number;
  yearsOfService: number;
  pensionPercentage: number;
  finalSalary: number;
  replacementRatio: number;
};

function calculateRetirement(params: {
  currentAge: number;
  retirementAge: number;
  currentSalary: number;
  annualIncrease: number;
  contributionRate: number;
}): Result {
  const { currentAge, retirementAge, currentSalary, annualIncrease, contributionRate } = params;
  const yearsOfService = retirementAge - currentAge;
  const years = Math.max(yearsOfService, 0);

  let finalSalary = currentSalary;
  let totalContributions = 0;
  const increaseRate = annualIncrease / 100;

  for (let y = 0; y < years; y++) {
    finalSalary = finalSalary * (1 + increaseRate);
    totalContributions += finalSalary * contributionRate * 12;
  }

  const pensionPercentage = Math.min(35, yearsOfService * 1 + (yearsOfService > 30 ? 5 : 0));
  const monthlyPension = finalSalary * (pensionPercentage / 100);
  const replacementRatio = (monthlyPension / finalSalary) * 100;

  return {
    monthlyPension: Math.round(monthlyPension),
    totalContributions: Math.round(totalContributions),
    yearsOfService,
    pensionPercentage,
    finalSalary: Math.round(finalSalary),
    replacementRatio: Math.round(replacementRatio * 10) / 10,
  };
}

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState<string>('30');
  const [retirementAge, setRetirementAge] = useState<string>('60');
  const [currentSalary, setCurrentSalary] = useState<string>('15000000');
  const [annualIncrease, setAnnualIncrease] = useState<string>('15');
  const [contributionRate, setContributionRate] = useState<string>('7');
  const [result, setResult] = useState<Result | null>(null);

  const calculate = useCallback(() => {
    const ca = parseInt(currentAge);
    const ra = parseInt(retirementAge);
    const cs = parseFloat(currentSalary);
    const ai = parseFloat(annualIncrease);
    const cr = parseFloat(contributionRate);
    if (isNaN(ca) || isNaN(ra) || isNaN(cs) || ra <= ca) {
      return;
    }
    setResult(
      calculateRetirement({
        currentAge: ca,
        retirementAge: ra,
        currentSalary: cs,
        annualIncrease: ai,
        contributionRate: cr,
      }),
    );
  }, [currentAge, retirementAge, currentSalary, annualIncrease, contributionRate]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">محاسبه حقوق بازنشستگی</h2>
        <p className="text-sm text-[var(--text-muted)]">
          بر اساس قانون تأمین اجتماعی ایران، حقوق بازنشستگی بر درصدی از آخرین حقوق پایه محاسبه
          می‌شود.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'سن فعلی', value: currentAge, set: setCurrentAge },
            { label: 'سن بازنشستگی', value: retirementAge, set: setRetirementAge },
            { label: 'حقوق فعلی ماهانه (تومان)', value: currentSalary, set: setCurrentSalary },
            { label: 'افزایش حقوق سالانه (%)', value: annualIncrease, set: setAnnualIncrease },
            { label: 'نرخ حق بیمه (%)', value: contributionRate, set: setContributionRate },
          ].map((item) => (
            <div key={item.label}>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {item.label}
              </label>
              <input
                type="number"
                value={item.value}
                min="0"
                onChange={(e: ChangeEvent<HTMLInputElement>) => item.set(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
              />
            </div>
          ))}
        </div>

        <button
          onClick={calculate}
          className="w-full py-3 px-6 bg-[var(--color-primary)] text-[var(--text-inverted)] rounded-lg font-semibold hover:opacity-90 transition"
        >
          محاسبه کن
        </button>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">حقوق ماهانه بازنشستگی</p>
              <p className="text-xl font-bold text-[var(--color-success)] mt-1">
                {formatMoney(result.monthlyPension)} تومان
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">درصد جایگزینی حقوق</p>
              <p className="text-xl font-bold text-[var(--color-info)] mt-1">
                %{result.replacementRatio}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">سنوات خدمت</p>
              <p className="text-xl font-bold text-[var(--color-info)] mt-1">
                {result.yearsOfService} سال
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">حقوق نهایی قبل بازنشستگی</p>
              <p className="text-xl font-bold text-[var(--color-warning)] mt-1">
                {formatMoney(result.finalSalary)} تومان
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-3">توضیح محاسبه</h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p>
                • طبق قانون تأمین اجتماعی، نرخ بازنشستگی{' '}
                <strong>{result.pensionPercentage}%</strong> آخرین حقوق پایه است.
              </p>
              <p>
                • هر سال سابقه خدمت حدود <strong>۱٪</strong> به درصد بازنشستگی اضافه می‌شود.
              </p>
              <p>
                • سقف نرخ بازنشستگی <strong>۳۵٪</strong> آخرین حقوق پایه است.
              </p>
              <p>
                • مجموع حق بیمه پرداختی:{' '}
                <strong>{formatMoney(result.totalContributions)} تومان</strong>
              </p>
            </div>
            <div className="pt-2">
              <SaveScenarioButton
                tool="retirement-calculator"
                title={`بازنشستگی ${currentAge}→${retirementAge} سال`}
                summary={`حقوق بازنشستگی: ${formatMoney(result.monthlyPension)} | نرخ: ${result.pensionPercentage}%`}
                input={{
                  currentAge,
                  retirementAge,
                  currentSalary,
                  annualIncrease,
                  contributionRate,
                }}
                output={result}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
