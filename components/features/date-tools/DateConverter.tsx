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

const persianMonths = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];
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

export default function DateConverterPage() {
  const [mode, setMode] = useState<'shamsi-to-gregorian' | 'gregorian-to-shamsi'>(
    'shamsi-to-gregorian',
  );

  const [shamsiYear, setShamsiYear] = useState('');
  const [shamsiMonth, setShamsiMonth] = useState('');
  const [shamsiDay, setShamsiDay] = useState('');

  const [gregorianYear, setGregorianYear] = useState('');
  const [gregorianMonth, setGregorianMonth] = useState('');
  const [gregorianDay, setGregorianDay] = useState('');

  const result = useMemo(() => {
    if (mode === 'shamsi-to-gregorian') {
      const y = parseInt(shamsiYear);
      const m = parseInt(shamsiMonth);
      const d = parseInt(shamsiDay);
      if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1 || m < 1 || m > 12 || d < 1 || d > 31) {
        return null;
      }
      try {
        const g = persianToGregorian(y, m, d);
        return {
          title: 'تاریخ میلادی',
          date: `${gregorianMonths[g.month - 1]} ${g.day}, ${g.year}`,
          iso: `${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`,
        };
      } catch {
        return null;
      }
    } else {
      const y = parseInt(gregorianYear);
      const m = parseInt(gregorianMonth);
      const d = parseInt(gregorianDay);
      if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1 || m < 1 || m > 12 || d < 1 || d > 31) {
        return null;
      }
      try {
        const p = jdToPersian(gregorianToJd(y, m, d));
        return {
          title: 'تاریخ شمسی',
          date: `${p.day} ${persianMonths[p.month - 1]} ${p.year}`,
          iso: `${p.year}/${String(p.month).padStart(2, '0')}/${String(p.day).padStart(2, '0')}`,
        };
      } catch {
        return null;
      }
    }
  }, [mode, shamsiYear, shamsiMonth, shamsiDay, gregorianYear, gregorianMonth, gregorianDay]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-success-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            تبدیل تاریخ شمسی و میلادی
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            تاریخ شمسی (هجری خورشیدی) و میلادی (گریگورین) را به‌صورت آنی به یکدیگر تبدیل کنید.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          { value: 'shamsi-to-gregorian', label: 'شمسی → میلادی' },
          { value: 'gregorian-to-shamsi', label: 'میلادی → شمسی' },
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

      {mode === 'shamsi-to-gregorian' ? (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">تاریخ شمسی</h2>
          <div className="grid gap-4 grid-cols-3">
            <div>
              <label htmlFor="shamsi-year" className="text-sm text-[var(--text-muted)]">
                سال
              </label>
              <input
                id="shamsi-year"
                type="number"
                value={shamsiYear}
                onChange={(e) => setShamsiYear(e.target.value)}
                placeholder="۱۴۰۵"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="سال شمسی"
              />
            </div>
            <div>
              <label htmlFor="shamsi-month" className="text-sm text-[var(--text-muted)]">
                ماه
              </label>
              <input
                id="shamsi-month"
                type="number"
                value={shamsiMonth}
                onChange={(e) => setShamsiMonth(e.target.value)}
                placeholder="۳"
                min="1"
                max="12"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="ماه شمسی"
              />
            </div>
            <div>
              <label htmlFor="shamsi-day" className="text-sm text-[var(--text-muted)]">
                روز
              </label>
              <input
                id="shamsi-day"
                type="number"
                value={shamsiDay}
                onChange={(e) => setShamsiDay(e.target.value)}
                placeholder="۲۶"
                min="1"
                max="31"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="روز شمسی"
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">تاریخ میلادی</h2>
          <div className="grid gap-4 grid-cols-3">
            <div>
              <label htmlFor="greg-year" className="text-sm text-[var(--text-muted)]">
                سال
              </label>
              <input
                id="greg-year"
                type="number"
                value={gregorianYear}
                onChange={(e) => setGregorianYear(e.target.value)}
                placeholder="2026"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="سال میلادی"
              />
            </div>
            <div>
              <label htmlFor="greg-month" className="text-sm text-[var(--text-muted)]">
                ماه
              </label>
              <input
                id="greg-month"
                type="number"
                value={gregorianMonth}
                onChange={(e) => setGregorianMonth(e.target.value)}
                placeholder="6"
                min="1"
                max="12"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="ماه میلادی"
              />
            </div>
            <div>
              <label htmlFor="greg-day" className="text-sm text-[var(--text-muted)]">
                روز
              </label>
              <input
                id="greg-day"
                type="number"
                value={gregorianDay}
                onChange={(e) => setGregorianDay(e.target.value)}
                placeholder="16"
                min="1"
                max="31"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="روز میلادی"
              />
            </div>
          </div>
        </Card>
      )}

      {result ? (
        <Card className="p-6 space-y-3 border-[var(--color-success)]/30 bg-[rgb(var(--color-success-rgb)/0.05)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{result.title}</h3>
          <div className="text-2xl font-bold text-[var(--color-success)]">{result.date}</div>
          <div className="text-sm text-[var(--text-muted)] font-mono">{result.iso}</div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(result.iso)}
            className="inline-flex items-center gap-2 rounded-[14px] bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--text-inverted)] transition-all hover:brightness-110"
          >
            کپی
          </button>
        </Card>
      ) : null}
    </div>
  );
}
