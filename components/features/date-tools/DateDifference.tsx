'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import {
  differenceInDays,
  isValidGregorianDate,
} from '@/features/date-tools/date-tools.logic';

export default function DateDifferencePage() {
  const [startYear, setStartYear] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startDay, setStartDay] = useState('');
  const [endYear, setEndYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDay, setEndDay] = useState('');

  const result = useMemo(() => {
    const sy = parseInt(startYear),
      sm = parseInt(startMonth),
      sd = parseInt(startDay);
    const ey = parseInt(endYear),
      em = parseInt(endMonth),
      ed = parseInt(endDay);
    if ([sy, sm, sd, ey, em, ed].some(isNaN)) {
      return null;
    }
    if (
      !isValidGregorianDate({ year: sy, month: sm, day: sd }) ||
      !isValidGregorianDate({ year: ey, month: em, day: ed })
    ) {
      return null;
    }

    try {
      const diffDays = Math.abs(
        differenceInDays({ year: sy, month: sm, day: sd }, { year: ey, month: em, day: ed }),
      );
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      const months = Math.floor(diffDays / 30.44);
      const years = Math.floor(diffDays / 365.25);

      return { days: diffDays, weeks, remainingDays, months, years };
    } catch {
      return null;
    }
  }, [startYear, startMonth, startDay, endYear, endMonth, endDay]);

  const DateInputs = ({ prefix, label }: { prefix: string; label: string }) => (
    <Card className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{label}</h3>
      <div className="grid gap-3 grid-cols-3">
        <div>
          <label htmlFor={`${prefix}-year`} className="text-xs text-[var(--text-muted)]">
            سال
          </label>
          <input
            id={`${prefix}-year`}
            type="number"
            value={prefix === 'start' ? startYear : endYear}
            onChange={(e) =>
              prefix === 'start' ? setStartYear(e.target.value) : setEndYear(e.target.value)
            }
            placeholder="2026"
            className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label={`سال ${label}`}
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-month`} className="text-xs text-[var(--text-muted)]">
            ماه
          </label>
          <input
            id={`${prefix}-month`}
            type="number"
            value={prefix === 'start' ? startMonth : endMonth}
            onChange={(e) =>
              prefix === 'start' ? setStartMonth(e.target.value) : setEndMonth(e.target.value)
            }
            placeholder="6"
            min="1"
            max="12"
            className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label={`ماه ${label}`}
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-day`} className="text-xs text-[var(--text-muted)]">
            روز
          </label>
          <input
            id={`${prefix}-day`}
            type="number"
            value={prefix === 'start' ? startDay : endDay}
            onChange={(e) =>
              prefix === 'start' ? setStartDay(e.target.value) : setEndDay(e.target.value)
            }
            placeholder="16"
            min="1"
            max="31"
            className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label={`روز ${label}`}
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            محاسبه اختلاف تاریخ
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            تعداد روز، هفته، ماه و سال بین دو تاریخ میلادی را محاسبه کنید.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <DateInputs prefix="start" label="تاریخ شروع" />
        <DateInputs prefix="end" label="تاریخ پایان" />
      </div>

      {result ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: 'روز', value: result.days.toLocaleString('fa'), icon: '📅' },
            { label: 'هفته', value: result.weeks.toLocaleString('fa'), icon: '📆' },
            { label: 'ماه', value: result.months.toLocaleString('fa'), icon: '🗓️' },
            { label: 'سال', value: result.years.toLocaleString('fa'), icon: '⏳' },
          ].map((item) => (
            <Card key={item.label} className="p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-[var(--color-primary)]">{item.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{item.label}</div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
