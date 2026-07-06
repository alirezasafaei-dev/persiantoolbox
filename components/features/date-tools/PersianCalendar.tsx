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

function jdToPersian(jd: number): { year: number; month: number; day: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const gd = e - Math.floor((153 * m + 2) / 5) + 1;
  const gm = m + 3 - 12 * Math.floor(m / 10);
  const gy = 100 * b + d - 4800 + Math.floor(m / 10);
  const gy2 = gm > 2 ? gy + 1 : gy;
  const gdm = g_d_m[gm - 1] ?? 0;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    gdm;
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number, jd_p: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd_p = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd_p = 1 + ((days - 186) % 30);
  }
  return { year: jy, month: jm, day: jd_p };
}

const PERSIAN_MONTHS = [
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
const PERSIAN_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]; // 29 for Esfand in non-leap

function isPersianLeapYear(year: number): boolean {
  const regYears = [1, 5, 9, 13, 17, 22, 26, 30];
  const cycle = ((year - 1) % 33) + 1;
  return regYears.includes(cycle);
}

function getDaysInPersianMonth(year: number, month: number): number {
  if (month === 12) {
    return isPersianLeapYear(year) ? 30 : 29;
  }
  return DAYS_IN_MONTH[month - 1] ?? 30;
}

function getFirstDayOfWeek(year: number, month: number): number {
  const jd = gregorianToJd(2000, 3, 20);
  const pjd = persianToJdInternal(year, month, 1);
  const diff = pjd - jd;
  return ((diff % 7) + 7) % 7;
}

function persianToJdInternal(year: number, month: number, day: number): number {
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

function getTodayPersian(): { year: number; month: number; day: number } {
  const now = new Date();
  const jd = gregorianToJd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return jdToPersian(jd);
}

export default function PersianCalendarPage() {
  const today = useMemo(() => getTodayPersian(), []);
  const [selectedYear, setSelectedYear] = useState(today.year);
  const [selectedMonth, setSelectedMonth] = useState(today.month);

  const calendar = useMemo(() => {
    const daysInMonth = getDaysInPersianMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfWeek(selectedYear, selectedMonth);
    const days: Array<{ day: number; isToday: boolean; isEmpty: boolean }> = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, isToday: false, isEmpty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        isToday: d === today.day && selectedMonth === today.month && selectedYear === today.year,
        isEmpty: false,
      });
    }
    return days;
  }, [selectedYear, selectedMonth, today]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-success-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            تقویم فارسی {selectedYear}
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            امروز: {today.day} {PERSIAN_MONTHS[today.month - 1]} {today.year}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            if (selectedMonth === 1) {
              setSelectedMonth(12);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
          className="px-3 py-1 rounded-full bg-[var(--surface-1)] border border-[var(--border-light)] text-sm hover:bg-[var(--bg-subtle)]"
          aria-label="ماه قبل"
        >
          ◀
        </button>
        <span className="text-lg font-bold text-[var(--text-primary)]">
          {PERSIAN_MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
        <button
          type="button"
          onClick={() => {
            if (selectedMonth === 12) {
              setSelectedMonth(1);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
          className="px-3 py-1 rounded-full bg-[var(--surface-1)] border border-[var(--border-light)] text-sm hover:bg-[var(--bg-subtle)]"
          aria-label="ماه بعد"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedYear(today.year);
            setSelectedMonth(today.month);
          }}
          className="px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--text-inverted)] text-sm font-semibold"
        >
          امروز
        </button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {PERSIAN_WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-[var(--text-muted)] py-2">
              {day}
            </div>
          ))}
          {calendar.map((cell, i) => (
            <div
              key={i}
              className={`text-center py-2 rounded-[var(--radius-md)] text-sm ${(() => {
                if (cell.isEmpty) {
                  return '';
                }
                if (cell.isToday) {
                  return 'bg-[var(--color-primary)] text-[var(--text-inverted)] font-bold';
                }
                return 'hover:bg-[var(--bg-subtle)]';
              })()}`}
            >
              {cell.isEmpty ? '' : cell.day.toLocaleString('fa')}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
