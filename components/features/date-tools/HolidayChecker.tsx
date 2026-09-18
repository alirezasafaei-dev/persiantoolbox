'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { getJalaliHoliday, getIslamicHoliday } from '@/features/date-tools/holidays';
import {
  isValidJalaliDate as sharedIsValidJalali,
  isValidIslamicDate as sharedIsValidIslamic,
  daysInIslamicMonth,
} from '@/features/date-tools/date-tools.logic';

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
      if (!sharedIsValidJalali({ year: y, month: m, day: d })) {
        return null;
      }
      const holiday = getJalaliHoliday({ year: y, month: m, day: d });
      return holiday
        ? { title: holiday.title, type: holiday.type === 'official' ? 'رسمی' : 'فرهنگی' }
        : { title: null, type: null };
    }
    if (!sharedIsValidIslamic({ year: y, month: m, day: d })) {
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
    return daysInIslamicMonth(y, m) || 29;
  }, [mode, year, month]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-primary-rgb)/0.15),transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary)">
            بررسی تعطیلات رسمی
          </h1>
          <p className="text-base md:text-lg text-(--text-muted) leading-relaxed">
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
                ? 'bg-primary text-(--text-inverted)'
                : 'bg-(--surface-1) text-(--text-primary) border border-(--border-light)'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-(--text-primary)">
          {mode === 'jalali' ? 'تاریخ شمسی' : 'تاریخ قمری'}
        </h2>
        <div className="grid gap-4 grid-cols-3">
          <div>
            <label htmlFor="hc-year" className="text-sm text-(--text-muted)">
              سال
            </label>
            <input
              id="hc-year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={mode === 'jalali' ? '۱۴۰۵' : '۱۴۴۷'}
              className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
              aria-label="سال"
            />
          </div>
          <div>
            <label htmlFor="hc-month" className="text-sm text-(--text-muted)">
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
              className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
              aria-label="ماه"
            />
          </div>
          <div>
            <label htmlFor="hc-day" className="text-sm text-(--text-muted)">
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
              className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
              aria-label="روز"
            />
          </div>
        </div>
      </Card>

      {result ? (
        <Card
          className={`p-6 ${
            result.title
              ? 'border-warning/30 bg-[rgb(var(--color-warning-rgb)/0.05)]'
              : 'border-success/30 bg-[rgb(var(--color-success-rgb)/0.05)]'
          }`}
        >
          <h3 className="text-lg font-semibold text-(--text-primary) mb-2">نتیجه</h3>
          {result.title ? (
            <div>
              <div className="text-2xl font-bold text-warning">{result.title}</div>
              <div className="text-sm text-(--text-muted) mt-1">نوع تعطیلی: {result.type}</div>
            </div>
          ) : (
            <div className="text-lg font-semibold text-success">این تاریخ تعطیل رسمی نیست</div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
