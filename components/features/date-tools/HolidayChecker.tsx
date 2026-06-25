'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { getJalaliHoliday, getIslamicHoliday } from '@/features/date-tools/holidays';

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

const persianToJd = (year: number, month: number, day: number): number => {
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
};

const persianToGregorian = (year: number, month: number, day: number) => {
  const jd = persianToJd(year, month, day);
  return jdToGregorian(jd);
};

const gregorianToPersian = (year: number, month: number, day: number) => {
  const jd = gregorianToJd(year, month, day);
  return jdToPersian(jd);
};

function isValidJalaliDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) {
    return false;
  }
  if (m <= 6) {
    return d <= 31;
  }
  if (m <= 11) {
    return d <= 30;
  }
  const p = persianToGregorian(y, m, d);
  const check = gregorianToPersian(p.year, p.month, p.day);
  return check.year === y && check.month === m && check.day === d;
}

const islamicMonthDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

function isValidIslamicDate(_y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) {
    return false;
  }
  const maxDays = islamicMonthDays[m - 1] ?? 29;
  return d <= maxDays;
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

type CalendarMode = 'jalali' | 'islamic';

export default function HolidayCheckerPage() {
  const [mode, setMode] = useState<CalendarMode>('jalali');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const result = useMemo(() => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1 || m < 1 || m > 12 || d < 1 || d > 31) {
      return null;
    }
    if (mode === 'jalali') {
      if (!isValidJalaliDate(y, m, d)) {
        return null;
      }
      const holiday = getJalaliHoliday({ year: y, month: m, day: d });
      return holiday
        ? { title: holiday.title, type: holiday.type === 'official' ? 'رسمی' : 'فرهنگی' }
        : { title: null, type: null };
    }
    if (!isValidIslamicDate(y, m, d)) {
      return null;
    }
    const holiday = getIslamicHoliday({ year: y, month: m, day: d });
    return holiday
      ? { title: holiday.title, type: holiday.type === 'official' ? 'رسمی' : 'فرهنگی' }
      : { title: null, type: null };
  }, [mode, year, month, day]);

  const maxDay = useMemo(() => {
    const y = parseInt(year);
    const m = parseInt(month);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return 31;
    }
    if (mode === 'jalali') {
      return jalaliDaysInMonth(y, m);
    }
    return islamicMonthDays[m - 1] ?? 29;
  }, [mode, year, month]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            بررسی تعطیلات رسمی
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            ببینید یک تاریخ شمسی یا قمری تعطیل رسمی است یا نه.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: 'jalali', label: 'تاریخ شمسی' },
            { value: 'islamic', label: 'تاریخ قمری' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
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
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {mode === 'jalali' ? 'تاریخ شمسی' : 'تاریخ قمری'}
        </h2>
        <div className="grid gap-4 grid-cols-3">
          <div>
            <label htmlFor="hc-year" className="text-sm text-[var(--text-muted)]">
              سال
            </label>
            <input
              id="hc-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={mode === 'jalali' ? '۱۴۰۵' : '۱۴۴۷'}
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="سال"
            />
          </div>
          <div>
            <label htmlFor="hc-month" className="text-sm text-[var(--text-muted)]">
              ماه
            </label>
            <input
              id="hc-month"
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="۱"
              min="1"
              max="12"
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="ماه"
            />
          </div>
          <div>
            <label htmlFor="hc-day" className="text-sm text-[var(--text-muted)]">
              روز
            </label>
            <input
              id="hc-day"
              type="number"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="۱"
              min="1"
              max={maxDay}
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="روز"
            />
          </div>
        </div>
      </Card>

      {result && (
        <Card
          className={`p-6 ${
            result.title
              ? 'border-[var(--color-warning)]/30 bg-[rgb(var(--color-warning-rgb)/0.05)]'
              : 'border-[var(--color-success)]/30 bg-[rgb(var(--color-success-rgb)/0.05)]'
          }`}
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">نتیجه</h3>
          {result.title ? (
            <div>
              <div className="text-2xl font-bold text-[var(--color-warning)]">{result.title}</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">نوع تعطیلی: {result.type}</div>
            </div>
          ) : (
            <div className="text-lg font-semibold text-[var(--color-success)]">
              این تاریخ تعطیل رسمی نیست
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
