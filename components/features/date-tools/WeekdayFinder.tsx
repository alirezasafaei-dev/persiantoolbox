'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { jalaliToGregorian, gregorianToJalali, daysInGregorianMonth, isValidJalaliDate, isValidGregorianDate } from '@/features/date-tools/date-tools.logic';

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

const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

const gregorianMonths = [
  'ژانویه',
  'فوریه',
  'مارس',
  'آوریل',
  'مه',
  'ژوئن',
  'ژوئیه',
  'اوت',
  'سپتامبر',
  'اکتبر',
  'نوامبر',
  'دسامبر',
];

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

export default function WeekdayFinderPage() {
  const [mode, setMode] = useState<'jalali' | 'gregorian'>('jalali');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [offset, setOffset] = useState('0');

  const result = useMemo(() => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return null;
    }
    if (mode === 'jalali' && !isValidJalaliDate({ year: y, month: m, day: d })) {
      return null;
    }
    if (mode === 'gregorian' && !isValidGregorianDate({ year: y, month: m, day: d })) {
      return null;
    }
    const off = parseInt(offset) || 0;
    try {
      let g: { year: number; month: number; day: number };
      if (mode === 'jalali') {
        g = jalaliToGregorian(y, m, d);
      } else {
        g = { year: y, month: m, day: d };
      }
      const jd = gregorianToJd(g.year, g.month, g.day) + off;
      const shifted = jdToGregorian(jd);
      const shiftedJd = gregorianToJd(shifted.year, shifted.month, shifted.day);
      const weekdayIndex = (shiftedJd + 1) % 7;
      const persian = gregorianToJalali(shifted.year, shifted.month, shifted.day);
      return {
        weekday: WEEKDAYS[weekdayIndex] ?? '',
        gregorian: shifted,
        persian,
        gregorianStr: `${shifted.year} ${gregorianMonths[shifted.month - 1]} ${shifted.day}`,
        persianStr: `${persian.year}/${String(persian.month).padStart(2, '0')}/${String(persian.day).padStart(2, '0')}`,
      };
    } catch {
      return null;
    }
  }, [mode, year, month, day, offset]);

  const maxDay = useMemo(() => {
    const y = parseInt(year);
    const m = parseInt(month);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return 31;
    }
    if (mode === 'jalali') {
      return jalaliDaysInMonth(y, m);
    }
    return daysInGregorianMonth(y, m) || 30;
  }, [mode, year, month]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">روز هفته</h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            روز هفته هر تاریخ شمسی یا میلادی را با جابجایی روز محاسبه کنید.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          { value: 'jalali', label: 'تاریخ شمسی' },
          { value: 'gregorian', label: 'تاریخ میلادی' },
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
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {mode === 'jalali' ? 'تاریخ شمسی' : 'تاریخ میلادی'}
        </h2>
        <div className="grid gap-4 grid-cols-3">
          <div>
            <label htmlFor="wk-year" className="text-sm text-[var(--text-muted)]">
              سال
            </label>
            <input
              id="wk-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={mode === 'jalali' ? '۱۴۰۵' : '2026'}
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="سال"
            />
          </div>
          <div>
            <label htmlFor="wk-month" className="text-sm text-[var(--text-muted)]">
              ماه
            </label>
            <input
              id="wk-month"
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="۴"
              min="1"
              max="12"
              className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label="ماه"
            />
          </div>
          <div>
            <label htmlFor="wk-day" className="text-sm text-[var(--text-muted)]">
              روز
            </label>
            <input
              id="wk-day"
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
        <div>
          <label htmlFor="wk-offset" className="text-sm text-[var(--text-muted)]">
            جابجایی (روز)
          </label>
          <input
            id="wk-offset"
            type="number"
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
            placeholder="0"
            className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            aria-label="جابجایی روز"
          />
        </div>
      </Card>

      {result ? (
        <Card className="p-6 border-[var(--color-success)]/30 bg-[rgb(var(--color-success-rgb)/0.05)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">نتیجه</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <div className="text-xs text-[var(--text-muted)]">روز هفته</div>
              <div className="text-2xl font-bold text-[var(--color-success)]">{result.weekday}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">تاریخ میلادی</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {result.gregorianStr}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">تاریخ شمسی</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {result.persianStr}
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
