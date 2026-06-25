'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';

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

function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function jdToPersian(jd: number): { year: number; month: number; day: number } {
  const g = jdToGregorian(jd);
  const gy = g.year;
  const gm = g.month;
  const gd = g.day;
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gdmValue = g_d_m[gm - 1] ?? 0;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    gdmValue;
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd_p: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd_p = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd_p = 1 + ((days - 186) % 30);
  }
  return { year: jy, month: jm, day: jd_p };
}

function persianToJd(year: number, month: number, day: number): number {
  const epbase = year - 474;
  const epyear = 474 + (epbase % 2820);
  let jd = day;
  if (month < 7) {
    jd += (month - 1) * 31;
  } else {
    jd += (month - 7) * 30 + 6;
  }
  jd +=
    Math.floor((epyear * 682 - 110) / 2816) +
    (epyear - 1) * 365 +
    Math.floor(epbase / 2820) * 1029983 +
    (1948439 - 10925);
  return jd;
}

function persianToGregorian(
  year: number,
  month: number,
  day: number,
): { year: number; month: number; day: number } {
  const jd = persianToJd(year, month, day);
  return jdToGregorian(jd);
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

function gregorianDaysInMonth(year: number, month: number): number {
  const dims = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    return 29;
  }
  return dims[month - 1] ?? 30;
}

function compareDateParts(
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number },
): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
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
    days += gregorianDaysInMonth(prevYear, prevMonth);
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
    if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1 || m < 1 || m > 12 || d < 1 || d > 31) {
      return null;
    }
    try {
      let birthG: { year: number; month: number; day: number };
      if (mode === 'jalali') {
        birthG = persianToGregorian(y, m, d);
      } else {
        birthG = { year: y, month: m, day: d };
      }
      if (compareDateParts(birthG, today) > 0) {
        return null;
      }
      return {
        ...computeAge(birthG, today),
        persian: jdToPersian(gregorianToJd(birthG.year, birthG.month, birthG.day)),
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
    return gregorianDaysInMonth(y, m);
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

      {result && (
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
      )}

      {result && (
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
      )}
    </div>
  );
}
