'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import { recordHistory } from '@/shared/history/recordHistory';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';
import {
  addDays,
  compareDateParts,
  differenceInDays,
  differenceInYmd,
  gregorianToJalali,
  gregorianToIslamic,
  isValidIslamicDate,
  isValidJalaliDate,
  normalizeToGregorian,
  type CalendarType,
  type DateParts,
  getWeekdayName,
} from '@/features/date-tools/date-tools.logic';
import { getIslamicHoliday, getJalaliHoliday } from '@/features/date-tools/holidays';
import { toEnglishDigits } from '@/shared/utils/numbers';

type ParseResult = { ok: true; date: DateParts } | { ok: false; error: string };

const pad = (n: number) => n.toString().padStart(2, '0');

const formatDateParts = (d: DateParts) => `${d.year}/${pad(d.month)}/${pad(d.day)}`;
const formatGregorian = (d: DateParts) => formatDateParts(d);
const formatJalali = (d: DateParts) => {
  const j = gregorianToJalali(d.year, d.month, d.day);
  return `${j.year}/${pad(j.month)}/${pad(j.day)}`;
};
const formatIslamic = (d: DateParts) => {
  const i = gregorianToIslamic(d.year, d.month, d.day);
  return `${i.year}/${pad(i.month)}/${pad(i.day)}`;
};
const calendarPlaceholder = (calendar: CalendarType) => {
  if (calendar === 'jalali') {
    return '1403/01/01';
  }
  if (calendar === 'gregorian') {
    return '2024/03/20';
  }
  return '1445/09/01';
};

const formatDateInput = (value: string) => {
  const digits = toEnglishDigits(value).replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
};

const parseDateInput = (value: string): ParseResult => {
  const normalized = toEnglishDigits(value)
    .replaceAll('-', '/')
    .replaceAll('.', '/')
    .replace(/\s+/g, '')
    .trim();

  const parts = normalized.split('/');
  if (parts.length !== 3) {
    return { ok: false, error: 'فرمت تاریخ باید به صورت سال/ماه/روز باشد.' };
  }
  const year = Number(parts[0] ?? '');
  const month = Number(parts[1] ?? '');
  const day = Number(parts[2] ?? '');
  if ([year, month, day].some((n) => Number.isNaN(n))) {
    return { ok: false, error: 'لطفاً فقط عدد وارد کنید.' };
  }
  return { ok: true, date: { year, month, day } };
};

const HolidayCalendarToggle = ({
  value,
  onChange,
}: {
  value: 'jalali' | 'islamic';
  onChange: (v: 'jalali' | 'islamic') => void;
}) => {
  const options: Array<'jalali' | 'islamic'> = ['jalali', 'islamic'];
  const labels: Record<'jalali' | 'islamic', string> = {
    jalali: 'شمسی',
    islamic: 'قمری',
  };
  return (
    <div className="inline-flex rounded-full border border-[var(--border-medium)] bg-[var(--surface-1)] p-1 text-xs">
      {options.map((item) => (
        <button
          key={item}
          type="button"
          className={`px-3 py-2 rounded-full font-bold transition-all duration-[var(--motion-fast)] ${
            value === item
              ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]'
              : 'text-[var(--text-primary)]'
          }`}
          onClick={() => onChange(item)}
        >
          {labels[item]}
        </button>
      ))}
    </div>
  );
};

const CalendarToggle = ({
  value,
  onChange,
}: {
  value: CalendarType;
  onChange: (v: CalendarType) => void;
}) => {
  const options: CalendarType[] = ['jalali', 'gregorian', 'islamic'];
  const labels: Record<CalendarType, string> = {
    jalali: 'شمسی',
    gregorian: 'میلادی',
    islamic: 'قمری',
  };
  return (
    <div className="inline-flex rounded-full border border-[var(--border-medium)] bg-[var(--surface-1)] p-1 text-xs">
      {options.map((item) => (
        <button
          key={item}
          type="button"
          className={`px-3 py-2 rounded-full font-bold transition-all duration-[var(--motion-fast)] ${
            value === item
              ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]'
              : 'text-[var(--text-primary)]'
          }`}
          onClick={() => onChange(item)}
        >
          {labels[item]}
        </button>
      ))}
    </div>
  );
};

export default function DateToolsPage() {
  const { showToast, recordCopy } = useToast();
  const today = useMemo<DateParts>(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, []);

  // Conversion states
  const [convertCalendar, setConvertCalendar] = useState<CalendarType>('jalali');
  const [convertInput, setConvertInput] = useState('1403/01/01');

  // Age states
  const [ageDateInput, setAgeDateInput] = useState('1375/06/01');
  const [ageCalendar, setAgeCalendar] = useState<CalendarType>('jalali');
  const [customNowInput, setCustomNowInput] = useState('');
  const [customNowCal, setCustomNowCal] = useState<CalendarType>('gregorian');
  const [useCustomNow, setUseCustomNow] = useState(false);

  // Difference states
  const [startInput, setStartInput] = useState('1402/12/29');
  const [startCal, setStartCal] = useState<CalendarType>('jalali');
  const [endInput, setEndInput] = useState('1403/01/05');
  const [endCal, setEndCal] = useState<CalendarType>('jalali');

  // Weekday / offset
  const [weekdayInput, setWeekdayInput] = useState('2024/03/20');
  const [weekdayCal, setWeekdayCal] = useState<CalendarType>('gregorian');
  const [offsetText, setOffsetText] = useState('0');

  // Holiday lookup
  const [holidayInput, setHolidayInput] = useState('1403/01/01');
  const [holidayCalendar, setHolidayCalendar] = useState<'jalali' | 'islamic'>('jalali');

  const convertState = useMemo(() => {
    const parsed = parseDateInput(convertInput);
    if (!parsed.ok) {
      return { outputs: null, error: parsed.error };
    }
    const normalized = normalizeToGregorian(parsed.date, convertCalendar);
    if (!normalized) {
      const message =
        convertCalendar === 'jalali'
          ? 'تاریخ شمسی معتبر نیست.'
          : convertCalendar === 'islamic'
            ? 'تاریخ قمری معتبر نیست.'
            : 'تاریخ میلادی معتبر نیست.';
      return { outputs: null, error: message };
    }
    const jalali = gregorianToJalali(normalized.year, normalized.month, normalized.day);
    const islamic = gregorianToIslamic(normalized.year, normalized.month, normalized.day);
    return {
      outputs: {
        gregorian: formatDateParts(normalized),
        jalali: formatDateParts(jalali),
        islamic: formatDateParts(islamic),
      },
      error: null,
    };
  }, [convertInput, convertCalendar]);

  const ageState = useMemo(() => {
    const dobParsed = parseDateInput(ageDateInput);
    if (!dobParsed.ok) {
      return { result: null, error: dobParsed.error };
    }
    const dobGregorian = normalizeToGregorian(dobParsed.date, ageCalendar);
    if (!dobGregorian) {
      return { result: null, error: 'تاریخ تولد معتبر نیست.' };
    }

    let referenceParts: DateParts | null = today;
    if (useCustomNow) {
      const parsed = parseDateInput(customNowInput || formatGregorian(today));
      if (!parsed.ok) {
        referenceParts = null;
      } else {
        referenceParts = normalizeToGregorian(parsed.date, customNowCal);
      }
    }

    if (!referenceParts) {
      return { result: null, error: 'تاریخ مرجع معتبر نیست.' };
    }
    if (compareDateParts(referenceParts, dobGregorian) < 0) {
      return { result: null, error: 'تاریخ تولد نباید بعد از تاریخ مرجع باشد.' };
    }
    const ymd = differenceInYmd(dobGregorian, referenceParts);
    const days = differenceInDays(dobGregorian, referenceParts);
    return { result: { ymd, days, reference: referenceParts }, error: null };
  }, [ageDateInput, ageCalendar, useCustomNow, customNowInput, customNowCal, today]);

  const diffState = useMemo(() => {
    const sParsed = parseDateInput(startInput);
    const eParsed = parseDateInput(endInput);
    if (!sParsed.ok) {
      return { result: null, error: sParsed.error };
    }
    if (!eParsed.ok) {
      return { result: null, error: eParsed.error };
    }
    const s = normalizeToGregorian(sParsed.date, startCal);
    const e = normalizeToGregorian(eParsed.date, endCal);
    if (!s || !e) {
      return { result: null, error: 'یکی از تاریخ‌ها معتبر نیست.' };
    }
    const days = differenceInDays(s, e);
    const ymd = differenceInYmd(s, e);
    return { result: { days, ymd, s, e }, error: null };
  }, [startInput, endInput, startCal, endCal]);

  const weekdayState = useMemo(() => {
    const parsed = parseDateInput(weekdayInput);
    if (!parsed.ok) {
      return { result: null, error: parsed.error };
    }
    const base = normalizeToGregorian(parsed.date, weekdayCal);
    if (!base) {
      return { result: null, error: 'تاریخ واردشده معتبر نیست.' };
    }
    const offset = Number(toEnglishDigits(offsetText || '0'));
    if (Number.isNaN(offset)) {
      return { result: null, error: 'افست روز باید عدد باشد.' };
    }
    const shifted = addDays(base, offset);
    return { result: { base, shifted }, error: null };
  }, [weekdayInput, weekdayCal, offsetText]);

  const holidayState = useMemo(() => {
    const parsed = parseDateInput(holidayInput);
    if (!parsed.ok) {
      return { holiday: null, error: parsed.error };
    }
    if (holidayCalendar === 'jalali') {
      if (!isValidJalaliDate(parsed.date)) {
        return { holiday: null, error: 'تاریخ شمسی معتبر نیست.' };
      }
      return { holiday: getJalaliHoliday(parsed.date), error: null };
    }
    if (!isValidIslamicDate(parsed.date)) {
      return { holiday: null, error: 'تاریخ قمری معتبر نیست.' };
    }
    return { holiday: getIslamicHoliday(parsed.date), error: null };
  }, [holidayInput, holidayCalendar]);

  const ageResult = ageState.result;
  const diffResult = diffState.result;
  const weekdayResult = weekdayState.result;

  const copyValue = async (value: string, label: string) => {
    const text = value.trim();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} کپی شد`, 'success');
      recordCopy(label, text);
      void recordHistory({
        tool: 'date-tools',
        inputSummary: label,
        outputSummary: text,
      });
    } catch {
      showToast('کپی انجام نشد', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-info)]"></span>
          ابزارهای تاریخ - کاملاً آفلاین
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">ابزارهای تاریخ</h1>
        <p className="text-[var(--text-secondary)]">
          تبدیل تاریخ شمسی و میلادی، محاسبه سن، اختلاف تاریخ و پیدا کردن روز هفته با دقت بالا.
        </p>
      </header>

      {/* Conversion */}
      <Card className="p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">تبدیل تاریخ</div>
            <div className="text-xs text-[var(--text-muted)]">شمسی ↔ میلادی ↔ قمری</div>
          </div>
          <CalendarToggle value={convertCalendar} onChange={setConvertCalendar} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="تاریخ ورودی (YYYY/MM/DD)"
            value={convertInput}
            onChange={(e) => setConvertInput(formatDateInput(e.target.value))}
            dir="ltr"
            inputMode="numeric"
            placeholder={calendarPlaceholder(convertCalendar)}
          />
          <div className="space-y-3">
            <Input
              label="خروجی میلادی"
              readOnly
              value={convertState.outputs?.gregorian ?? ''}
              dir="ltr"
              placeholder="2024/03/20"
              endAction={
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--text-muted)]"
                  onClick={() => copyValue(convertState.outputs?.gregorian ?? '', 'تبدیل میلادی')}
                >
                  Copy
                </button>
              }
            />
            <Input
              label="خروجی شمسی"
              readOnly
              value={convertState.outputs?.jalali ?? ''}
              dir="ltr"
              placeholder="1403/01/01"
              endAction={
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--text-muted)]"
                  onClick={() => copyValue(convertState.outputs?.jalali ?? '', 'تبدیل شمسی')}
                >
                  Copy
                </button>
              }
            />
            <Input
              label="خروجی قمری"
              readOnly
              value={convertState.outputs?.islamic ?? ''}
              dir="ltr"
              placeholder="1445/09/01"
              endAction={
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--text-muted)]"
                  onClick={() => copyValue(convertState.outputs?.islamic ?? '', 'تبدیل قمری')}
                >
                  Copy
                </button>
              }
            />
          </div>
        </div>
        {convertState.error && (
          <div className="text-sm text-[var(--color-danger)]" role="alert" aria-live="assertive">
            {convertState.error}
          </div>
        )}
        <div className="text-xs text-[var(--text-muted)]">
          تاریخ قمری بر اساس تقویم محاسباتی است و ممکن است با رؤیت هلال یک روز اختلاف داشته باشد.
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() =>
              copyValue(
                `میلادی: ${convertState.outputs?.gregorian ?? ''}\nشمسی: ${convertState.outputs?.jalali ?? ''}\nقمری: ${convertState.outputs?.islamic ?? ''}`,
                'کپی همه تبدیل تاریخ',
              )
            }
          >
            Copy All
          </button>
        </div>
      </Card>

      {/* Age */}
      <Card className="p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">محاسبه سن</div>
            <div className="text-xs text-[var(--text-muted)]">بر اساس تاریخ تولد</div>
          </div>
          <CalendarToggle value={ageCalendar} onChange={setAgeCalendar} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="تاریخ تولد"
            value={ageDateInput}
            onChange={(e) => setAgeDateInput(formatDateInput(e.target.value))}
            dir="ltr"
            inputMode="numeric"
            placeholder={calendarPlaceholder(ageCalendar)}
          />
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={useCustomNow}
                onChange={(e) => setUseCustomNow(e.target.checked)}
              />
              محاسبه تا تاریخ دلخواه
            </label>
            {useCustomNow && (
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <Input
                  label="تاریخ مرجع"
                  value={customNowInput}
                  onChange={(e) => setCustomNowInput(formatDateInput(e.target.value))}
                  dir="ltr"
                  inputMode="numeric"
                  placeholder={calendarPlaceholder(customNowCal)}
                />
                <div className="flex items-end">
                  <CalendarToggle value={customNowCal} onChange={setCustomNowCal} />
                </div>
              </div>
            )}
          </div>
        </div>
        {ageState.error && (
          <div className="text-sm text-[var(--color-danger)]" role="alert" aria-live="assertive">
            {ageState.error}
          </div>
        )}
        {ageResult && (
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">سن دقیق</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {ageResult.ymd.years} سال و {ageResult.ymd.months} ماه و {ageResult.ymd.days} روز
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(
                    `${ageResult.ymd.years} سال و ${ageResult.ymd.months} ماه و ${ageResult.ymd.days} روز`,
                    'سن دقیق',
                  )
                }
              >
                Copy
              </button>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">کل روزها</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {ageResult.days.toLocaleString('fa-IR')} روز
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(`${ageResult.days.toLocaleString('fa-IR')} روز`, 'کل روزها')
                }
              >
                Copy
              </button>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">تاریخ مرجع</div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                میلادی: {formatGregorian(ageResult.reference)} <br />
                شمسی: {formatJalali(ageResult.reference)} <br />
                قمری: {formatIslamic(ageResult.reference)}
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(
                    `میلادی: ${formatGregorian(ageResult.reference)} | شمسی: ${formatJalali(
                      ageResult.reference,
                    )} | قمری: ${formatIslamic(ageResult.reference)}`,
                    'تاریخ مرجع',
                  )
                }
              >
                Copy
              </button>
            </div>
          </div>
        )}
        {ageResult && (
          <div className="text-xs text-[var(--text-muted)]">
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)]"
              onClick={() =>
                copyValue(
                  `سن دقیق: ${ageResult.ymd.years} سال و ${ageResult.ymd.months} ماه و ${ageResult.ymd.days} روز\nکل روزها: ${ageResult.days.toLocaleString(
                    'fa-IR',
                  )} روز\nتاریخ مرجع: میلادی ${formatGregorian(
                    ageResult.reference,
                  )} | شمسی ${formatJalali(ageResult.reference)} | قمری ${formatIslamic(
                    ageResult.reference,
                  )}`,
                  'کپی همه محاسبه سن',
                )
              }
            >
              Copy All
            </button>
          </div>
        )}
      </Card>

      {/* Difference */}
      <Card className="p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">فاصله دو تاریخ</div>
            <div className="text-xs text-[var(--text-muted)]">تعداد روز و سال/ماه/روز</div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-primary)]">تاریخ شروع</span>
              <CalendarToggle value={startCal} onChange={setStartCal} />
            </div>
            <Input
              value={startInput}
              onChange={(e) => setStartInput(formatDateInput(e.target.value))}
              dir="ltr"
              inputMode="numeric"
              placeholder={calendarPlaceholder(startCal)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-primary)]">تاریخ پایان</span>
              <CalendarToggle value={endCal} onChange={setEndCal} />
            </div>
            <Input
              value={endInput}
              onChange={(e) => setEndInput(formatDateInput(e.target.value))}
              dir="ltr"
              inputMode="numeric"
              placeholder={calendarPlaceholder(endCal)}
            />
          </div>
        </div>
        {diffState.error && (
          <div className="text-sm text-[var(--color-danger)]" role="alert" aria-live="assertive">
            {diffState.error}
          </div>
        )}
        {diffResult && (
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">تعداد روز</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {diffResult.days.toLocaleString('fa-IR')} روز
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(`${diffResult.days.toLocaleString('fa-IR')} روز`, 'تعداد روز')
                }
              >
                Copy
              </button>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">بر حسب سال/ماه/روز</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {diffResult.ymd.years} سال، {diffResult.ymd.months} ماه، {diffResult.ymd.days} روز
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(
                    `${diffResult.ymd.years} سال، ${diffResult.ymd.months} ماه، ${diffResult.ymd.days} روز`,
                    'فاصله تاریخ‌ها',
                  )
                }
              >
                Copy
              </button>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4 space-y-2">
              <div className="text-xs text-[var(--text-muted)]">نمایش سه تقویم</div>
              <div className="text-[var(--text-primary)] font-medium">
                شروع: میلادی {formatGregorian(diffResult.s)} | شمسی {formatJalali(diffResult.s)} |
                قمری {formatIslamic(diffResult.s)}
              </div>
              <div className="text-[var(--text-primary)] font-medium">
                پایان: میلادی {formatGregorian(diffResult.e)} | شمسی {formatJalali(diffResult.e)} |
                قمری {formatIslamic(diffResult.e)}
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(
                    `شروع: ${formatGregorian(diffResult.s)} | ${formatJalali(
                      diffResult.s,
                    )} | ${formatIslamic(diffResult.s)} ؛ پایان: ${formatGregorian(
                      diffResult.e,
                    )} | ${formatJalali(diffResult.e)} | ${formatIslamic(diffResult.e)}`,
                    'سه تقویم',
                  )
                }
              >
                Copy
              </button>
            </div>
          </div>
        )}
        {diffResult && (
          <div className="text-xs text-[var(--text-muted)]">
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)]"
              onClick={() =>
                copyValue(
                  `فاصله دو تاریخ:\nتعداد روز: ${diffResult.days.toLocaleString(
                    'fa-IR',
                  )}\nبر حسب سال/ماه/روز: ${diffResult.ymd.years} سال، ${diffResult.ymd.months} ماه، ${diffResult.ymd.days} روز\nشروع: میلادی ${formatGregorian(
                    diffResult.s,
                  )} | شمسی ${formatJalali(diffResult.s)} | قمری ${formatIslamic(
                    diffResult.s,
                  )}\nپایان: میلادی ${formatGregorian(diffResult.e)} | شمسی ${formatJalali(
                    diffResult.e,
                  )} | قمری ${formatIslamic(diffResult.e)}`,
                  'کپی همه فاصله تاریخ',
                )
              }
            >
              Copy All
            </button>
          </div>
        )}
      </Card>

      {/* Weekday & offset */}
      <Card className="p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">روز هفته + جابجایی</div>
            <div className="text-xs text-[var(--text-muted)]">
              پیدا کردن نام روز و تاریخ بعد/قبل
            </div>
          </div>
          <CalendarToggle value={weekdayCal} onChange={setWeekdayCal} />
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Input
            label="تاریخ مبنا"
            value={weekdayInput}
            onChange={(e) => setWeekdayInput(formatDateInput(e.target.value))}
            dir="ltr"
            inputMode="numeric"
            placeholder={calendarPlaceholder(weekdayCal)}
          />
          <Input
            label="جابجایی (روز)"
            value={offsetText}
            onChange={(e) => setOffsetText(e.target.value)}
            dir="ltr"
            inputMode="numeric"
            placeholder="0"
          />
        </div>
        {weekdayState.error && (
          <div className="text-sm text-[var(--color-danger)]" role="alert" aria-live="assertive">
            {weekdayState.error}
          </div>
        )}
        {weekdayResult && (
          <div className="grid gap-3 md:grid-cols-4 text-sm">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">روز هفته</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {getWeekdayName(weekdayResult.shifted)}
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() => copyValue(getWeekdayName(weekdayResult.shifted), 'روز هفته')}
              >
                Copy
              </button>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">تاریخ نهایی (میلادی)</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {formatGregorian(weekdayResult.shifted)}
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(formatGregorian(weekdayResult.shifted), 'تاریخ نهایی میلادی')
                }
              >
                Copy
              </button>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">تاریخ نهایی (شمسی)</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {formatJalali(weekdayResult.shifted)}
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() => copyValue(formatJalali(weekdayResult.shifted), 'تاریخ نهایی شمسی')}
              >
                Copy
              </button>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">تاریخ نهایی (قمری)</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {formatIslamic(weekdayResult.shifted)}
              </div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() => copyValue(formatIslamic(weekdayResult.shifted), 'تاریخ نهایی قمری')}
              >
                Copy
              </button>
            </div>
          </div>
        )}
        {weekdayResult && (
          <div className="text-xs text-[var(--text-muted)]">
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)]"
              onClick={() =>
                copyValue(
                  `روز هفته: ${getWeekdayName(
                    weekdayResult.shifted,
                  )}\nمیلادی: ${formatGregorian(weekdayResult.shifted)}\nشمسی: ${formatJalali(
                    weekdayResult.shifted,
                  )}\nقمری: ${formatIslamic(weekdayResult.shifted)}`,
                  'کپی همه روز هفته',
                )
              }
            >
              Copy All
            </button>
          </div>
        )}
      </Card>

      {/* Holidays */}
      <Card className="p-5 md:p-6 space-y-4">
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">تعطیلات رسمی (آفلاین)</div>
          <div className="text-xs text-[var(--text-muted)]">
            تعطیلات شمسی ثابت + تعطیلات قمری رسمی
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[var(--text-muted)]">انتخاب نوع تقویم</div>
          <HolidayCalendarToggle value={holidayCalendar} onChange={setHolidayCalendar} />
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-end">
          <Input
            label="تاریخ ورودی"
            value={holidayInput}
            onChange={(e) => setHolidayInput(formatDateInput(e.target.value))}
            dir="ltr"
            inputMode="numeric"
            placeholder={holidayCalendar === 'jalali' ? '1403/01/01' : '1445/09/10'}
          />
          <div className="text-center text-sm text-[var(--text-muted)]">وضعیت</div>
          <Input
            label="نتیجه"
            readOnly
            value={holidayState.holiday ? holidayState.holiday.title : ''}
            placeholder="تعطیل نیست"
            endAction={
              <button
                type="button"
                className="text-xs font-semibold text-[var(--text-muted)]"
                onClick={() => copyValue(holidayState.holiday?.title ?? '', 'تعطیلات رسمی')}
              >
                Copy
              </button>
            }
          />
        </div>
        {holidayState.error && (
          <div className="text-sm text-[var(--color-danger)]" role="alert" aria-live="assertive">
            {holidayState.error}
          </div>
        )}
        {holidayState.holiday && (
          <div className="text-xs text-[var(--text-muted)]">
            نوع: {holidayState.holiday.type === 'official' ? 'رسمی' : 'فرهنگی'}
          </div>
        )}
        {holidayCalendar === 'islamic' && (
          <div className="text-xs text-[var(--text-muted)]">
            تاریخ‌های قمری بر پایه تقویم محاسباتی هستند و ممکن است یک روز اختلاف داشته باشند.
          </div>
        )}
      </Card>
      <RecentHistoryCard title="آخرین عملیات تاریخ" toolIds={['date-tools']} />
    </div>
  );
}
