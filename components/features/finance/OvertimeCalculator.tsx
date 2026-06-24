'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';
import SaveScenarioButton from '@/shared/ui/SaveScenarioButton';

const OVERTIME_MULTIPLIER = {
  weekday_normal: 1.4,
  weekday_night: 1.7,
  friday_normal: 2.0,
  friday_night: 2.4,
  holiday_normal: 2.0,
  holiday_night: 2.4,
} as const;

const OVERTIME_LABELS: Record<string, string> = {
  weekday_normal: 'روز عادی (۱.۴ برابر)',
  weekday_night: 'شب روز عادی (۱.۷ برابر)',
  friday_normal: 'جمعه (۲ برابر)',
  friday_night: 'شب جمعه (۲.۴ برابر)',
  holiday_normal: 'تعطیلات رسمی (۲ برابر)',
  holiday_night: 'شب تعطیلات رسمی (۲.۴ برابر)',
};

type OvertimeEntry = {
  type: keyof typeof OVERTIME_MULTIPLIER;
  hours: number;
};

export default function OvertimeCalculator() {
  const [monthlySalary, setMonthlySalary] = useState('10000000');
  const [entries, setEntries] = useState<OvertimeEntry[]>([
    { type: 'weekday_normal', hours: 0 },
    { type: 'weekday_night', hours: 0 },
    { type: 'friday_normal', hours: 0 },
    { type: 'friday_night', hours: 0 },
    { type: 'holiday_normal', hours: 0 },
    { type: 'holiday_night', hours: 0 },
  ]);

  const result = useMemo(() => {
    const salary = parseFloat(monthlySalary) || 0;
    const dailyRate = salary / 22;
    const hourlyRate = dailyRate / 8;

    let totalOvertimePay = 0;
    const breakdown = entries.map((entry) => {
      const multiplier = OVERTIME_MULTIPLIER[entry.type];
      const pay = entry.hours * hourlyRate * multiplier;
      totalOvertimePay += pay;
      return {
        type: entry.type,
        label: OVERTIME_LABELS[entry.type],
        hours: entry.hours,
        multiplier,
        pay,
      };
    });

    return {
      hourlyRate,
      dailyRate,
      totalOvertimePay,
      breakdown,
    };
  }, [monthlySalary, entries]);

  const updateEntry = (index: number, hours: number) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, hours } : e)));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">محاسبه اضافه‌کاری</h2>
        <p className="text-sm text-[var(--text-muted)]">
          طبق قانون کار ایران، نرخ اضافه‌کاری بر اساس نوع روز و ساعت کاری متفاوت است.
        </p>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            حقوق پایه ماهانه (تومان)
          </label>
          <input
            type="number"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map((entry, i) => (
            <div key={entry.type} className="flex items-center gap-2">
              <label className="text-sm text-[var(--text-secondary)] w-48">
                {OVERTIME_LABELS[entry.type]}
              </label>
              <input
                type="number"
                min="0"
                value={entry.hours || ''}
                onChange={(e) => updateEntry(i, parseFloat(e.target.value) || 0)}
                placeholder="ساعت"
                className="flex-1 px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">نرخ ساعتی</p>
          <p className="text-lg font-bold text-[var(--color-info)]">
            {formatMoneyFa(result.hourlyRate)} تومان
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">نرخ روزانه</p>
          <p className="text-lg font-bold text-[var(--color-info)]">
            {formatMoneyFa(result.dailyRate)} تومان
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">مجموع اضافه‌کاری</p>
          <p className="text-lg font-bold text-[var(--color-success)]">
            {formatMoneyFa(result.totalOvertimePay)} تومان
          </p>
          <div className="mt-2">
            <SaveScenarioButton
              tool="overtime-calculator"
              title={`اضافه‌کاری ${formatMoneyFa(parseInt(monthlySalary) || 0)}`}
              summary={`مجموع اضافه‌کاری: ${formatMoneyFa(result.totalOvertimePay)} | نرخ ساعتی: ${formatMoneyFa(result.hourlyRate)}`}
              input={{ monthlySalary, entries }}
              output={result}
              disabled={result.totalOvertimePay <= 0}
            />
          </div>
        </Card>
      </div>

      {result.breakdown.some((b) => b.hours > 0) && (
        <Card className="p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-3">جزئیات</h3>
          <div className="space-y-2">
            {result.breakdown
              .filter((b) => b.hours > 0)
              .map((b) => (
                <div key={b.type} className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {b.label} × {b.hours} ساعت
                  </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {formatMoneyFa(b.pay)} تومان
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
