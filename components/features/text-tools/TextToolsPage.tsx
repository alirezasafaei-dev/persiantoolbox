'use client';

import { useMemo, useState } from 'react';
import { AsyncState, Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { convertDate } from '@/features/date-tools/date-tools.logic';
import { numberToWordsFa, parseLooseNumber, toEnglishDigits } from '@/shared/utils/numbers';
import { cleanPersianText, slugifyPersian } from '@/shared/utils/localization';
import { useToast } from '@/shared/ui/toast-context';
import AddressFaToEnTool from '@/components/features/text-tools/AddressFaToEnTool';

type CalendarType = 'jalali' | 'gregorian';

type ParseResult =
  | { ok: true; date: { year: number; month: number; day: number } }
  | { ok: false; error: string };

const pad = (n: number) => n.toString().padStart(2, '0');

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

export default function TextToolsPage() {
  const { showToast } = useToast();
  const [calendarInput, setCalendarInput] = useState('1403/01/01');
  const [calendarType, setCalendarType] = useState<CalendarType>('jalali');
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarOutput, setCalendarOutput] = useState('');

  const [numberInput, setNumberInput] = useState('123456');
  const [numberError, setNumberError] = useState<string | null>(null);

  const [textInput, setTextInput] = useState('');
  const [slugInput, setSlugInput] = useState('سلام دنیا ۱۲۳');

  const wordStats = useMemo(() => {
    const trimmed = textInput.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
    const characters = textInput.length;
    const charactersNoSpaces = textInput.replace(/\s/g, '').length;
    return { words, characters, charactersNoSpaces };
  }, [textInput]);

  const normalizedText = useMemo(() => cleanPersianText(textInput), [textInput]);
  const slugText = useMemo(() => slugifyPersian(slugInput), [slugInput]);

  const handleDateConvert = () => {
    const parsed = parseDateInput(calendarInput);
    if (!parsed.ok) {
      setCalendarError(parsed.error);
      setCalendarOutput('');
      return;
    }

    const result = convertDate({
      date: parsed.date,
      from: calendarType,
      to: calendarType === 'jalali' ? 'gregorian' : 'jalali',
    });

    if (!result.ok) {
      setCalendarError(result.error.message);
      setCalendarOutput('');
      return;
    }

    const output = result.data;
    setCalendarOutput(`${output.year}/${pad(output.month)}/${pad(output.day)}`);
    setCalendarError(null);
  };

  const numberWords = useMemo(() => {
    const parsed = parseLooseNumber(numberInput);
    if (parsed === null) {
      return '';
    }
    return numberToWordsFa(parsed);
  }, [numberInput]);

  const handleNumberConvert = () => {
    const parsed = parseLooseNumber(numberInput);
    if (parsed === null) {
      setNumberError('لطفاً عدد معتبر وارد کنید.');
      return;
    }
    setNumberError(null);
  };

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
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)]"></span>
          ابزارهای متنی - کاملاً آفلاین
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">ابزارهای متنی</h1>
        <p className="text-[var(--text-secondary)]">
          تبدیل تاریخ، تبدیل عدد به حروف و شمارش کلمات برای متن‌های فارسی و انگلیسی.
        </p>
      </header>

      <AddressFaToEnTool compact />

      <Card className="p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">تبدیل تاریخ</div>
            <div className="text-xs text-[var(--text-muted)]">شمسی ↔ میلادی</div>
          </div>
          <div className="inline-flex rounded-full border border-[var(--border-medium)] bg-[var(--surface-1)] p-1 text-xs">
            <button
              type="button"
              className={`px-3 py-2 rounded-full font-bold transition-all duration-[var(--motion-fast)] ${
                calendarType === 'jalali'
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]'
                  : 'text-[var(--text-primary)]'
              }`}
              onClick={() => setCalendarType('jalali')}
              aria-pressed={calendarType === 'jalali'}
            >
              شمسی
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded-full font-bold transition-all duration-[var(--motion-fast)] ${
                calendarType === 'gregorian'
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]'
                  : 'text-[var(--text-primary)]'
              }`}
              onClick={() => setCalendarType('gregorian')}
              aria-pressed={calendarType === 'gregorian'}
            >
              میلادی
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-end">
          <Input
            label={
              calendarType === 'jalali' ? 'تاریخ شمسی (YYYY/MM/DD)' : 'تاریخ میلادی (YYYY/MM/DD)'
            }
            value={calendarInput}
            onChange={(e) => setCalendarInput(formatDateInput(e.target.value))}
            placeholder="1403/01/01"
            inputMode="numeric"
          />
          <Button type="button" variant="secondary" onClick={handleDateConvert}>
            تبدیل
          </Button>
          <Input label="خروجی" value={calendarOutput} readOnly placeholder="----/--/--" />
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyValue(calendarOutput, 'خروجی تاریخ')}
          >
            Copy
          </button>
        </div>
        {calendarError && <AsyncState variant="error" description={calendarError} />}
      </Card>

      <Card className="p-5 md:p-6 space-y-4">
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">تبدیل عدد به حروف</div>
          <div className="text-xs text-[var(--text-muted)]">
            خروجی فارسی برای اعداد صحیح و اعشاری
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <Input
            label="عدد"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="123456"
          />
          <Button type="button" variant="secondary" onClick={handleNumberConvert}>
            تبدیل
          </Button>
        </div>
        {numberError && <AsyncState variant="error" description={numberError} />}
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {numberWords || 'خروجی اینجا نمایش داده می‌شود.'}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyValue(numberWords, 'عدد به حروف')}
          >
            Copy
          </button>
        </div>
      </Card>

      <Card className="p-5 md:p-6 space-y-4">
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">شمارش کلمات</div>
          <div className="text-xs text-[var(--text-muted)]">تعداد کلمات و کاراکترها</div>
        </div>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={6}
          className="input-field"
          placeholder="متن خود را وارد کنید..."
        />
        <div className="grid gap-3 sm:grid-cols-3 text-sm text-[var(--text-secondary)]">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3">
            کلمات: {wordStats.words}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3">
            کاراکترها: {wordStats.characters}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3">
            بدون فاصله: {wordStats.charactersNoSpaces}
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6 space-y-4">
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">نرمال‌سازی متن فارسی</div>
          <div className="text-xs text-[var(--text-muted)]">
            اصلاح ک/ی عربی، حذف کشیده و فاصله‌گذاری صحیح
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
          {normalizedText || 'متن نرمال‌شده اینجا نمایش داده می‌شود.'}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyValue(normalizedText, 'متن نرمال‌شده')}
          >
            Copy
          </button>
          {normalizedText ? (
            <button
              type="button"
              className="ms-3 font-semibold text-[var(--color-primary)]"
              onClick={() =>
                copyValue(
                  `متن نرمال‌شده:\n${normalizedText}\n\nاسلاگ:\n${slugText}`,
                  'کپی همه متن‌ها',
                )
              }
            >
              Copy All
            </button>
          ) : null}
        </div>
      </Card>

      <Card className="p-5 md:p-6 space-y-4">
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">تبدیل به اسلاگ</div>
          <div className="text-xs text-[var(--text-muted)]">
            مناسب برای URL و شناسه‌های قابل خواندن
          </div>
        </div>
        <Input
          label="متن ورودی"
          value={slugInput}
          onChange={(e) => setSlugInput(e.target.value)}
          placeholder="سلام دنیا ۱۲۳"
        />
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {slugText || 'اسلاگ اینجا نمایش داده می‌شود.'}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyValue(slugText, 'اسلاگ')}
          >
            Copy
          </button>
        </div>
      </Card>
    </div>
  );
}
