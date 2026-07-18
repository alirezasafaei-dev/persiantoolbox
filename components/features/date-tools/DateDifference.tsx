'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import {
  differenceInDays,
  isValidGregorianDate,
  isValidJalaliDate,
  jalaliToGregorian,
  type CalendarType,
  type DateParts,
} from '@/features/date-tools/date-tools.logic';

type SupportedCalendar = Extract<CalendarType, 'jalali' | 'gregorian'>;

type DateInputState = {
  year: string;
  month: string;
  day: string;
};

const EMPTY_DATE: DateInputState = { year: '', month: '', day: '' };

const parseDate = (value: DateInputState): DateParts | null => {
  const year = Number.parseInt(value.year, 10);
  const month = Number.parseInt(value.month, 10);
  const day = Number.parseInt(value.day, 10);

  if ([year, month, day].some(Number.isNaN)) {
    return null;
  }

  return { year, month, day };
};

const isComplete = (value: DateInputState) => Boolean(value.year && value.month && value.day);

const toGregorianDate = (value: DateParts, calendar: SupportedCalendar): DateParts | null => {
  if (calendar === 'jalali') {
    if (!isValidJalaliDate(value)) {
      return null;
    }
    return jalaliToGregorian(value.year, value.month, value.day);
  }

  return isValidGregorianDate(value) ? value : null;
};

export default function DateDifferencePage() {
  const [calendar, setCalendar] = useState<SupportedCalendar>('jalali');
  const [startDate, setStartDate] = useState<DateInputState>(EMPTY_DATE);
  const [endDate, setEndDate] = useState<DateInputState>(EMPTY_DATE);

  const calculation = useMemo(() => {
    const parsedStart = parseDate(startDate);
    const parsedEnd = parseDate(endDate);
    const hasCompleteInput = isComplete(startDate) && isComplete(endDate);

    if (!parsedStart || !parsedEnd) {
      return { result: null, invalid: hasCompleteInput };
    }

    const gregorianStart = toGregorianDate(parsedStart, calendar);
    const gregorianEnd = toGregorianDate(parsedEnd, calendar);

    if (!gregorianStart || !gregorianEnd) {
      return { result: null, invalid: true };
    }

    try {
      const days = Math.abs(differenceInDays(gregorianStart, gregorianEnd));
      return {
        invalid: false,
        result: {
          days,
          weeks: Math.floor(days / 7),
          remainingDays: days % 7,
          approximateMonths: Math.floor(days / 30.44),
          approximateYears: Math.floor(days / 365.25),
        },
      };
    } catch {
      return { result: null, invalid: true };
    }
  }, [calendar, endDate, startDate]);

  const updateDate = (
    target: 'start' | 'end',
    field: keyof DateInputState,
    value: string,
  ) => {
    const updater = target === 'start' ? setStartDate : setEndDate;
    updater((current) => ({ ...current, [field]: value }));
  };

  const switchCalendar = (nextCalendar: SupportedCalendar) => {
    setCalendar(nextCalendar);
    setStartDate(EMPTY_DATE);
    setEndDate(EMPTY_DATE);
  };

  const DateInputs = ({ target, label }: { target: 'start' | 'end'; label: string }) => {
    const value = target === 'start' ? startDate : endDate;
    const yearPlaceholder = calendar === 'jalali' ? '۱۴۰۵' : '2026';

    return (
      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">{label}</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3" dir="ltr">
          <div>
            <label htmlFor={`${target}-year`} className="text-xs text-[var(--text-muted)]">
              سال
            </label>
            <input
              id={`${target}-year`}
              inputMode="numeric"
              type="number"
              value={value.year}
              onChange={(event) => updateDate(target, 'year', event.target.value)}
              placeholder={yearPlaceholder}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-center text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label={`سال ${label}`}
            />
          </div>
          <div>
            <label htmlFor={`${target}-month`} className="text-xs text-[var(--text-muted)]">
              ماه
            </label>
            <input
              id={`${target}-month`}
              inputMode="numeric"
              type="number"
              min="1"
              max="12"
              value={value.month}
              onChange={(event) => updateDate(target, 'month', event.target.value)}
              placeholder="1"
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-center text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label={`ماه ${label}`}
            />
          </div>
          <div>
            <label htmlFor={`${target}-day`} className="text-xs text-[var(--text-muted)]">
              روز
            </label>
            <input
              id={`${target}-day`}
              inputMode="numeric"
              type="number"
              min="1"
              max="31"
              value={value.day}
              onChange={(event) => updateDate(target, 'day', event.target.value)}
              placeholder="1"
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-center text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              aria-label={`روز ${label}`}
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            محاسبه فاصله بین دو تاریخ شمسی و میلادی
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
            تعداد دقیق روزهای بین دو تاریخ را محاسبه کنید و معادل آن را به هفته، ماه و سال
            تقریبی ببینید. همه محاسبات در مرورگر شما انجام می‌شود.
          </p>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="calendar-type-heading">
        <h2 id="calendar-type-heading" className="text-base font-bold text-[var(--text-primary)]">
          نوع تقویم را انتخاب کنید
        </h2>
        <div className="grid grid-cols-2 gap-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-1">
          {([
            ['jalali', 'تاریخ شمسی'],
            ['gregorian', 'تاریخ میلادی'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => switchCalendar(value)}
              aria-pressed={calendar === value}
              className={`rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold transition-colors ${
                calendar === value
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <DateInputs target="start" label="تاریخ شروع" />
        <DateInputs target="end" label="تاریخ پایان" />
      </div>

      {calculation.invalid ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[rgb(var(--color-danger-rgb)/0.08)] px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          تاریخ واردشده معتبر نیست. تعداد روزهای هر ماه و سال کبیسه را بررسی کنید.
        </p>
      ) : null}

      {calculation.result ? (
        <section className="space-y-3" aria-live="polite" aria-labelledby="date-result-heading">
          <h2 id="date-result-heading" className="text-lg font-bold text-[var(--text-primary)]">
            نتیجه اختلاف دو تاریخ
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                label: 'روز دقیق',
                value: calculation.result.days.toLocaleString('fa-IR'),
                icon: '📅',
              },
              {
                label: 'هفته کامل',
                value: calculation.result.weeks.toLocaleString('fa-IR'),
                icon: '📆',
              },
              {
                label: 'ماه تقریبی',
                value: calculation.result.approximateMonths.toLocaleString('fa-IR'),
                icon: '🗓️',
              },
              {
                label: 'سال تقریبی',
                value: calculation.result.approximateYears.toLocaleString('fa-IR'),
                icon: '⏳',
              },
            ].map((item) => (
              <Card key={item.label} className="p-4 text-center">
                <div className="mb-2 text-2xl" aria-hidden="true">
                  {item.icon}
                </div>
                <div className="text-2xl font-bold text-[var(--color-primary)]">{item.value}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</div>
              </Card>
            ))}
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            معادل هفته: {calculation.result.weeks.toLocaleString('fa-IR')} هفته و{' '}
            {calculation.result.remainingDays.toLocaleString('fa-IR')} روز. مقادیر ماه و سال بر اساس
            میانگین تقویمی نمایش داده می‌شوند.
          </p>
        </section>
      ) : null}

      <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 md:p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          این محاسبه برای چه کارهایی مفید است؟
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['سابقه کار و قرارداد', 'محاسبه تعداد روزهای دقیق میان شروع و پایان همکاری یا قرارداد.'],
            ['شمارش معکوس', 'بررسی تعداد روز باقی‌مانده تا امتحان، سفر، رویداد یا سررسید.'],
            ['مقایسه تاریخ‌ها', 'سنجش فاصله زمانی میان دو رویداد در تقویم شمسی یا میلادی.'],
            ['برنامه‌ریزی پروژه', 'محاسبه طول بازه اجرا، تأخیر یا مدت زمان تحویل یک فعالیت.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
