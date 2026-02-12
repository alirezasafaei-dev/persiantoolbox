'use client';

import { useMemo, useState } from 'react';
import { AsyncState, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import {
  addDays,
  compareDateParts,
  differenceInDays,
  differenceInYmd,
  gregorianToIslamic,
  gregorianToJalali,
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
type DateInputFields = { year: string; month: string; day: string };

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

const jalaliMonths = [
  'فروردین - ماه اول',
  'اردیبهشت - ماه دوم',
  'خرداد - ماه سوم',
  'تیر - ماه چهارم',
  'مرداد - ماه پنجم',
  'شهریور - ماه ششم',
  'مهر - ماه هفتم',
  'آبان - ماه هشتم',
  'آذر - ماه نهم',
  'دی - ماه دهم',
  'بهمن - ماه یازدهم',
  'اسفند - ماه دوازدهم',
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

const islamicMonths = [
  'محرم',
  'صفر',
  'ربیع‌الاول',
  'ربیع‌الثانی',
  'جمادی‌الاول',
  'جمادی‌الثانی',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذیقعده',
  'ذیحجه',
];

function getMonthLabels(calendar: CalendarType): string[] {
  if (calendar === 'jalali') {
    return jalaliMonths;
  }
  if (calendar === 'gregorian') {
    return gregorianMonths;
  }
  return islamicMonths;
}

function toFields(value: DateParts): DateInputFields {
  return { year: String(value.year), month: String(value.month), day: String(value.day) };
}

function parseDateFields(value: DateInputFields): ParseResult {
  const year = Number(toEnglishDigits(value.year).trim());
  const month = Number(toEnglishDigits(value.month).trim());
  const day = Number(toEnglishDigits(value.day).trim());
  if ([year, month, day].some((n) => Number.isNaN(n))) {
    return { ok: false, error: 'لطفاً روز، ماه و سال را کامل و عددی وارد کنید.' };
  }
  return { ok: true, date: { year, month, day } };
}

const HolidayCalendarToggle = ({
  value,
  onChange,
}: {
  value: 'jalali' | 'islamic';
  onChange: (v: 'jalali' | 'islamic') => void;
}) => {
  const options: Array<'jalali' | 'islamic'> = ['jalali', 'islamic'];
  const labels: Record<'jalali' | 'islamic', string> = { jalali: 'شمسی', islamic: 'قمری' };
  return (
    <div className="inline-flex rounded-full border border-[var(--border-medium)] bg-[var(--surface-1)] p-1 text-xs">
      {options.map((item) => (
        <button
          key={item}
          type="button"
          className={`rounded-full px-3 py-2 font-bold transition-all duration-[var(--motion-fast)] ${
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
          className={`rounded-full px-3 py-2 font-bold transition-all duration-[var(--motion-fast)] ${
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

function DatePartsFields({
  label,
  calendar,
  value,
  onChange,
}: {
  label: string;
  calendar: CalendarType;
  value: DateInputFields;
  onChange: (next: DateInputFields) => void;
}) {
  const monthLabels = getMonthLabels(calendar);
  const fieldPrefix = label.trim();
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
      <div className="grid gap-3 md:grid-cols-[0.8fr_1.5fr_0.9fr]">
        <div className="space-y-1">
          <div className="text-xs text-[var(--text-muted)]">روز</div>
          <select
            value={value.day}
            onChange={(event) => onChange({ ...value, day: event.target.value })}
            aria-label={`${fieldPrefix} - روز`}
            className="input-field"
          >
            {Array.from({ length: 31 }).map((_, index) => {
              const day = index + 1;
              return (
                <option key={day} value={day}>
                  {day.toLocaleString('fa-IR')}
                </option>
              );
            })}
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-[var(--text-muted)]">ماه</div>
          <select
            value={value.month}
            onChange={(event) => onChange({ ...value, month: event.target.value })}
            aria-label={`${fieldPrefix} - ماه`}
            className="input-field"
          >
            {monthLabels.map((monthLabel, index) => (
              <option key={monthLabel} value={index + 1}>
                {monthLabel}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-[var(--text-muted)]">سال</div>
          <input
            value={value.year}
            onChange={(event) =>
              onChange({
                ...value,
                year: toEnglishDigits(event.target.value).replace(/\D/g, '').slice(0, 4),
              })
            }
            className="input-field ltr-num"
            inputMode="numeric"
            aria-label={`${fieldPrefix} - سال`}
            placeholder={calendar === 'gregorian' ? '2024' : '1404'}
          />
        </div>
      </div>
    </div>
  );
}

export default function DateToolsPage() {
  const { showToast } = useToast();
  const today = useMemo<DateParts>(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, []);

  const [convertCalendar, setConvertCalendar] = useState<CalendarType>('jalali');
  const [convertInput, setConvertInput] = useState<DateInputFields>({
    year: '1404',
    month: '1',
    day: '1',
  });

  const [ageCalendar, setAgeCalendar] = useState<CalendarType>('jalali');
  const [ageDateInput, setAgeDateInput] = useState<DateInputFields>({
    year: '1375',
    month: '6',
    day: '1',
  });
  const [customNowCal, setCustomNowCal] = useState<CalendarType>('gregorian');
  const [customNowInput, setCustomNowInput] = useState<DateInputFields>(toFields(today));
  const [useCustomNow, setUseCustomNow] = useState(false);

  const [startCal, setStartCal] = useState<CalendarType>('jalali');
  const [startInput, setStartInput] = useState<DateInputFields>({
    year: '1402',
    month: '12',
    day: '29',
  });
  const [endCal, setEndCal] = useState<CalendarType>('jalali');
  const [endInput, setEndInput] = useState<DateInputFields>({
    year: '1403',
    month: '1',
    day: '5',
  });

  const [weekdayCal, setWeekdayCal] = useState<CalendarType>('gregorian');
  const [weekdayInput, setWeekdayInput] = useState<DateInputFields>({
    year: '2024',
    month: '3',
    day: '20',
  });
  const [offsetText, setOffsetText] = useState('0');

  const [holidayCalendar, setHolidayCalendar] = useState<'jalali' | 'islamic'>('jalali');
  const [holidayInput, setHolidayInput] = useState<DateInputFields>({
    year: '1403',
    month: '1',
    day: '1',
  });

  const convertState = useMemo(() => {
    const parsed = parseDateFields(convertInput);
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
  }, [convertCalendar, convertInput]);

  const ageState = useMemo(() => {
    const dobParsed = parseDateFields(ageDateInput);
    if (!dobParsed.ok) {
      return { result: null, error: dobParsed.error };
    }
    const dobGregorian = normalizeToGregorian(dobParsed.date, ageCalendar);
    if (!dobGregorian) {
      return { result: null, error: 'تاریخ تولد معتبر نیست.' };
    }

    let referenceParts: DateParts | null = today;
    if (useCustomNow) {
      const parsed = parseDateFields(customNowInput);
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
  }, [ageCalendar, ageDateInput, customNowCal, customNowInput, today, useCustomNow]);

  const diffState = useMemo(() => {
    const sParsed = parseDateFields(startInput);
    const eParsed = parseDateFields(endInput);
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
    return {
      result: { days: differenceInDays(s, e), ymd: differenceInYmd(s, e), s, e },
      error: null,
    };
  }, [endCal, endInput, startCal, startInput]);

  const weekdayState = useMemo(() => {
    const parsed = parseDateFields(weekdayInput);
    if (!parsed.ok) {
      return { result: null, error: parsed.error };
    }
    const base = normalizeToGregorian(parsed.date, weekdayCal);
    if (!base) {
      return { result: null, error: 'تاریخ واردشده معتبر نیست.' };
    }
    const offset = Number(toEnglishDigits(offsetText || '0'));
    if (Number.isNaN(offset)) {
      return { result: null, error: 'جابجایی روز باید عدد باشد.' };
    }
    const shifted = addDays(base, offset);
    return { result: { base, shifted }, error: null };
  }, [offsetText, weekdayCal, weekdayInput]);

  const holidayState = useMemo(() => {
    const parsed = parseDateFields(holidayInput);
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
  }, [holidayCalendar, holidayInput]);

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
          تبدیل تاریخ شمسی/میلادی/قمری، محاسبه سن، فاصله تاریخ و روز هفته با ورودی ساختاریافته.
        </p>
      </header>

      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">تبدیل تاریخ</div>
            <div className="text-xs text-[var(--text-muted)]">شمسی ↔ میلادی ↔ قمری</div>
          </div>
          <CalendarToggle value={convertCalendar} onChange={setConvertCalendar} />
        </div>
        <DatePartsFields
          label="تاریخ ورودی"
          calendar={convertCalendar}
          value={convertInput}
          onChange={setConvertInput}
        />
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="خروجی میلادی" readOnly value={convertState.outputs?.gregorian ?? ''} />
          <Input label="خروجی شمسی" readOnly value={convertState.outputs?.jalali ?? ''} />
          <Input label="خروجی قمری" readOnly value={convertState.outputs?.islamic ?? ''} />
        </div>
        {convertState.error && <AsyncState variant="error" description={convertState.error} />}
      </Card>

      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">محاسبه سن</div>
            <div className="text-xs text-[var(--text-muted)]">بر اساس تاریخ تولد</div>
          </div>
          <CalendarToggle value={ageCalendar} onChange={setAgeCalendar} />
        </div>
        <DatePartsFields
          label="تاریخ تولد"
          calendar={ageCalendar}
          value={ageDateInput}
          onChange={setAgeDateInput}
        />
        <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={useCustomNow}
            onChange={(event) => setUseCustomNow(event.target.checked)}
          />
          محاسبه تا تاریخ دلخواه
        </label>
        {useCustomNow ? (
          <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
            <CalendarToggle value={customNowCal} onChange={setCustomNowCal} />
            <DatePartsFields
              label="تاریخ مرجع"
              calendar={customNowCal}
              value={customNowInput}
              onChange={setCustomNowInput}
            />
          </div>
        ) : null}
        {ageState.error && <AsyncState variant="error" description={ageState.error} />}
        {ageResult ? (
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">سن دقیق</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {ageResult.ymd.years} سال و {ageResult.ymd.months} ماه و {ageResult.ymd.days} روز
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">کل روزها</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {ageResult.days.toLocaleString('fa-IR')} روز
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">تاریخ مرجع</div>
              <div className="text-base font-bold text-[var(--text-primary)]">
                میلادی: {formatGregorian(ageResult.reference)}
                <br />
                شمسی: {formatJalali(ageResult.reference)}
                <br />
                قمری: {formatIslamic(ageResult.reference)}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-5 p-5 md:p-6">
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">فاصله دو تاریخ</div>
          <div className="text-xs text-[var(--text-muted)]">تعداد روز و سال/ماه/روز</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
            <CalendarToggle value={startCal} onChange={setStartCal} />
            <DatePartsFields
              label="تاریخ شروع"
              calendar={startCal}
              value={startInput}
              onChange={setStartInput}
            />
          </div>
          <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
            <CalendarToggle value={endCal} onChange={setEndCal} />
            <DatePartsFields
              label="تاریخ پایان"
              calendar={endCal}
              value={endInput}
              onChange={setEndInput}
            />
          </div>
        </div>
        {diffState.error && <AsyncState variant="error" description={diffState.error} />}
        {diffResult ? (
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">تعداد روز</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {diffResult.days.toLocaleString('fa-IR')} روز
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">بر حسب سال/ماه/روز</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {diffResult.ymd.years} سال، {diffResult.ymd.months} ماه، {diffResult.ymd.days} روز
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">کپی سریع</div>
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-[var(--color-primary)]"
                onClick={() =>
                  copyValue(
                    `${diffResult.ymd.years} سال، ${diffResult.ymd.months} ماه، ${diffResult.ymd.days} روز`,
                    'فاصله تاریخ',
                  )
                }
              >
                Copy
              </button>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">روز هفته + جابجایی</div>
            <div className="text-xs text-[var(--text-muted)]">روز هفته و تاریخ بعد/قبل</div>
          </div>
          <CalendarToggle value={weekdayCal} onChange={setWeekdayCal} />
        </div>
        <DatePartsFields
          label="تاریخ مبنا"
          calendar={weekdayCal}
          value={weekdayInput}
          onChange={setWeekdayInput}
        />
        <Input
          label="جابجایی (روز)"
          value={offsetText}
          onChange={(event) => setOffsetText(event.target.value)}
          dir="ltr"
          inputMode="numeric"
          placeholder="0"
        />
        {weekdayState.error && <AsyncState variant="error" description={weekdayState.error} />}
        {weekdayResult ? (
          <div className="grid gap-3 md:grid-cols-4 text-sm">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">روز هفته</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {getWeekdayName(weekdayResult.shifted)}
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">میلادی</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {formatGregorian(weekdayResult.shifted)}
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">شمسی</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {formatJalali(weekdayResult.shifted)}
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]/60 p-4">
              <div className="text-xs text-[var(--text-muted)]">قمری</div>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {formatIslamic(weekdayResult.shifted)}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              تعطیلات رسمی (آفلاین)
            </div>
            <div className="text-xs text-[var(--text-muted)]">شمسی ثابت + قمری رسمی</div>
          </div>
          <HolidayCalendarToggle value={holidayCalendar} onChange={setHolidayCalendar} />
        </div>
        <DatePartsFields
          label="تاریخ ورودی"
          calendar={holidayCalendar}
          value={holidayInput}
          onChange={setHolidayInput}
        />
        {holidayState.error && <AsyncState variant="error" description={holidayState.error} />}
        <Input
          label="نتیجه"
          readOnly
          value={holidayState.holiday?.title ?? ''}
          placeholder="تعطیل نیست"
        />
        {holidayState.holiday ? (
          <div className="text-xs text-[var(--text-muted)]">
            نوع تعطیلی: {holidayState.holiday.type === 'official' ? 'رسمی' : 'فرهنگی'}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
