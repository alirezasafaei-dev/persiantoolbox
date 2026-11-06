'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { calculateMonthlyDeductions } from '@/features/salary/payroll-deductions';
import { formatMoneyFa } from '@/shared/utils';
import SaveScenarioButton from '@/shared/ui/SaveScenarioButton';

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
  const totalIncome = grossSalary + benefits;
  const {
    insuranceBase,
    insurance: insuranceEmployee,
    taxableIncome,
    tax: taxAmount,
  } = calculateMonthlyDeductions({ gross: totalIncome });

  const netSalary = totalIncome - insuranceEmployee - taxAmount;
  const effectiveTaxRate = totalIncome > 0 ? (taxAmount / totalIncome) * 100 : 0;

  return {
    grossSalary,
    insuranceBase,
    insuranceEmployee,
    insuranceEmployer: insuranceBase * 0.23,
    taxFreeIncome: 40_000_000,
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
    <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
      <span className="text-sm text-(--text-muted)">{label}</span>
      <span
        className={`text-sm font-bold ${highlight ? 'text-success text-lg' : 'text-(--text-primary)'}`}
      >
        {value} تومان
      </span>
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-primary-rgb)/0.15),transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary)">
            محاسبه‌گر مالیات بر درآمد
          </h1>
          <p className="text-base md:text-lg text-(--text-muted) leading-relaxed">
            مالیات بر درآمد حقوق سال ۱۴۰۵ را محاسبه کنید. معافیت مالیاتی ماهانه: ۴۰ میلیون تومان.
          </p>
          <p className="text-sm text-(--text-muted)" data-testid="tax-calculation-scope">
            برآورد ماه ۳۰روزهٔ کارگر مشمول تأمین اجتماعی در سال ۱۴۰۵؛ ورودی‌ها فقط مبالغ مشمول بیمه
            و مالیات هستند. مسکن، بن و حق اولاد مصوب و مأموریت را در این ورودی‌ها وارد نکنید. سقف
            بیمه ۷ برابر حداقل مزد روزانه است. تسویهٔ تجمیعی سالانه، چند کارفرما و معافیت‌های خاص
            محاسبه نمی‌شوند.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-(--text-muted)">
            <span className="rounded-full border border-(--border-light) px-3 py-1">
              پردازش محلی
            </span>
            <span className="rounded-full border border-(--border-light) px-3 py-1">
              قوانین ۱۴۰۵
            </span>
            <span className="rounded-full border border-(--border-light) px-3 py-1">
              جدول پلکانی
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-(--text-primary)">اطلاعات ورودی</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="tax-gross" className="text-sm text-(--text-muted)">
                حقوق ناخالص ماهانه (تومان)
              </label>
              <input
                id="tax-gross"
                type="text"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                placeholder="مثال: ۲۰,۰۰۰,۰۰۰"
                className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
                aria-label="حقوق ناخالص"
              />
            </div>
            <div>
              <label htmlFor="tax-benefits" className="text-sm text-(--text-muted)">
                مزایا و بن‌ها (تومان)
              </label>
              <input
                id="tax-benefits"
                type="text"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="اختیاری"
                className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
                aria-label="مزایا"
              />
            </div>
          </div>
          <div className="rounded-md bg-(--bg-subtle) p-3 text-xs text-(--text-muted)">
            💡 معافیت مالیاتی سالانه: ۴۸۰ میلیون تومان (ماهانه ۴۰ میلیون تومان). نرخ بیمه تأمین
            اجتماعی: ۷٪
          </div>
        </Card>

        {result ? (
          <Card
            className="p-6 space-y-3"
            role="region"
            aria-live="polite"
            aria-label="نتیجه محاسبه مالیات"
          >
            <h2 className="text-lg font-semibold text-(--text-primary)">نتیجه محاسبه</h2>
            <ResultRow label="حقوق ناخالص" value={formatMoneyFa(result.grossSalary)} />
            <ResultRow label="حق بیمه کارگر (۷٪)" value={formatMoneyFa(result.insuranceEmployee)} />
            <ResultRow label="معافیت مالیاتی" value={formatMoneyFa(result.taxFreeIncome)} />
            <ResultRow label="درآمد مشمول مالیات" value={formatMoneyFa(result.taxableIncome)} />
            <ResultRow label="مالیات" value={formatMoneyFa(result.taxAmount)} />
            <div className="pt-2">
              <ResultRow label="حقوق خالص" value={formatMoneyFa(result.netSalary)} highlight />
            </div>
            <div className="text-xs text-(--text-muted) pt-2">
              نرخ مؤثر مالیات: {result.effectiveTaxRate.toFixed(1)}%
            </div>
            <div className="pt-2">
              <SaveScenarioButton
                tool="tax-calculator"
                title={`مالیات حقوق ${formatMoneyFa(gross)}`}
                summary={`ناخالص: ${formatMoneyFa(result.grossSalary)} | خالص: ${formatMoneyFa(result.netSalary)} | مالیات: ${formatMoneyFa(result.taxAmount)}`}
                input={{ grossSalary: gross, benefits: ben }}
                output={result}
                disabled={gross <= 0}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
