'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import {
  jalaliToGregorian,
  gregorianToJalali,
  daysInGregorianMonth,
  compareDateParts,
  isValidJalaliDate,
  isValidGregorianDate,
} from '@/features/date-tools/date-tools.logic';

function gregorianToJd(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jalaliDaysInMonth(year: number, month: number): number {
  if (month <= 6) {
    return 31;
  }
  if (month <= 11) {
    return 30;
  }
  const epbase = year - 474;
  const epyear = 474 + (epbase % 2820);
  const leap = (epyear * 682 - 110) % 2816 < 682;
  return leap ? 30 : 29;
}

function computeAge(
  birthG: { year: number; month: number; day: number },
  refG: { year: number; month: number; day: number },
): { years: number; months: number; days: number; totalDays: number } {
  const jd1 = gregorianToJd(birthG.year, birthG.month, birthG.day);
  const jd2 = gregorianToJd(refG.year, refG.month, refG.day);
  const totalDays = jd2 - jd1;
  if (totalDays < 0) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }
  let years = refG.year - birthG.year;
  let months = refG.month - birthG.month;
  let days = refG.day - birthG.day;
  if (days < 0) {
    months--;
    const prevMonth = refG.month === 1 ? 12 : refG.month - 1;
    const prevYear = refG.month === 1 ? refG.year - 1 : refG.year;
    days += daysInGregorianMonth(prevYear, prevMonth);
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days, totalDays };
}

export default function AgeCalculatorPage() {
  const [mode, setMode] = useState<'jalali' | 'gregorian'>('jalali');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, []);

  const result = useMemo(() => {
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    const d = parseInt(birthDay);
    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return null;
    }
    if (mode === 'jalali' && !isValidJalaliDate({ year: y, month: m, day: d })) {
      return null;
    }
    if (mode === 'gregorian' && !isValidGregorianDate({ year: y, month: m, day: d })) {
      return null;
    }
    try {
      let birthG: { year: number; month: number; day: number };
      if (mode === 'jalali') {
        birthG = jalaliToGregorian(y, m, d);
      } else {
        birthG = { year: y, month: m, day: d };
      }
      if (compareDateParts(birthG, today) > 0) {
        return null;
      }
      return {
        ...computeAge(birthG, today),
        persian: gregorianToJalali(birthG.year, birthG.month, birthG.day),
      };
    } catch {
      return null;
    }
  }, [mode, birthYear, birthMonth, birthDay, today]);

  const maxDay = useMemo(() => {
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return 31;
    }
    if (mode === 'jalali') {
      return jalaliDaysInMonth(y, m);
    }
    return daysInGregorianMonth(y, m) || 30;
  }, [mode, birthYear, birthMonth]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">محاسبه سن</h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            سن دقیق خود را بر اساس تاریخ تولد شمسی یا میلادی محاسبه کنید.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          { value: 'jalali', label: 'تولد شمسی' },
          { value: 'gregorian', label: 'تولد میلادی' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value as typeof mode)}
            aria-pressed={mode === opt.value}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              mode === opt.value
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">تاریخ تولد</h2>
        <div className="grid gap-4 grid-cols-3">
          <div>
            <label htmlFor="age-year" className="text-sm text-[var(--text-muted)]">
              سال
            </label>
            <input
              id="age-year"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder={mode === 'jalali' ? '۱۳۷۵' : '1996'}
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="سال تولد"
            />
          </div>
          <div>
            <label htmlFor="age-month" className="text-sm text-[var(--text-muted)]">
              ماه
            </label>
            <input
              id="age-month"
              type="number"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              placeholder="۶"
              min="1"
              max="12"
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="ماه تولد"
            />
          </div>
          <div>
            <label htmlFor="age-day" className="text-sm text-[var(--text-muted)]">
              روز
            </label>
            <input
              id="age-day"
              type="number"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              placeholder="۱۵"
              min="1"
              max={maxDay}
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="روز تولد"
            />
          </div>
        </div>
      </Card>

      {result ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">🎂</div>
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {result.years.toLocaleString('fa')}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">سال</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {result.months.toLocaleString('fa')}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">ماه</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">📆</div>
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {result.days.toLocaleString('fa')}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">روز</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {result.totalDays.toLocaleString('fa')}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">روز کل</div>
          </Card>
        </div>
      ) : null}

      {result ? (
        <Card className="p-6 border-[var(--color-success)]/30 bg-[rgb(var(--color-success-rgb)/0.05)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">سن دقیق شما</h3>
          <div className="text-2xl font-bold text-[var(--color-success)]">
            {result.years} سال و {result.months} ماه و {result.days} روز
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-2">
            معادل شمسی: {result.persian.year}/{String(result.persian.month).padStart(2, '0')}/
            {String(result.persian.day).padStart(2, '0')}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
