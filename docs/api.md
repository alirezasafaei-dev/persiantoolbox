# 📚 مرجع API (خلاصه)

> آخرین به‌روزرسانی: 2026-02-06

این فایل خلاصه‌ای از API عمومی است. برای مستندات کامل می‌توانید از Typedoc استفاده کنید:

```bash
pnpm docs:api
```

خروجی Typedoc در مسیر `docs/api/` ساخته می‌شود.

---

## ماژول‌ها و خروجی‌ها

تمام ماژول‌ها به‌صورت زیرمسیر از بسته NPM قابل دسترس‌اند:

- `persian-tools` (کل API)
- `persian-tools/numbers`
- `persian-tools/localization`
- `persian-tools/validation`
- `persian-tools/finance`
- `persian-tools/date-tools`

### Numbers

- `toEnglishDigits(input: string): string`
- `parseLooseNumber(input: string): number | null`
- `formatNumberFa(n: number): string`
- `formatMoneyFa(n: number): string`
- `numberToWordsFa(input: number): string`

**نمونه استفاده:**

```ts
import { parseLooseNumber, formatMoneyFa, numberToWordsFa } from 'persian-tools/numbers';

const raw = '۱۲۳,۴۵۰';
const value = parseLooseNumber(raw); // 123450
const money = value ? formatMoneyFa(value) : '';
const words = value ? numberToWordsFa(value) : '';
```

**Edge cases:**

- اگر ورودی نامعتبر باشد، `parseLooseNumber` مقدار `null` برمی‌گرداند.
- برای ورودی‌های `NaN` یا بی‌نهایت، `numberToWordsFa` رشته‌ی خالی می‌دهد.

### Localization (Persian)

- `toPersianNumbers(input: string | number): string`
- `formatPersianNumber(num: number): string`
- `formatPersianCurrency(amount: number, currency?: string): string`
- `rtlAttributes(): { dir: 'rtl'; 'aria-orientation': 'horizontal' }`
- `isPersianText(text: string): boolean`
- `formatPersianDate(date: Date | number): string`
- `fixPersianSpacing(text: string): string`
- `normalizePersianChars(text: string): string`
- `stripPersianDiacritics(text: string): string`
- `cleanPersianText(text: string): string`
- `slugifyPersian(text: string): string`

**نمونه استفاده:**

```ts
import { toPersianNumbers, cleanPersianText, slugifyPersian } from 'persian-tools/localization';

toPersianNumbers(1402); // "۱۴۰۲"
cleanPersianText('  كلاس   يازدهم  '); // "کلاس یازدهم"
slugifyPersian('ابزار تبدیل تاریخ ۱۴۰۲'); // "ابزار-تبدیل-تاریخ-1402"
```

**Edge cases:**

- `formatPersianDate` اگر تاریخ نامعتبر باشد رشته‌ی خالی برمی‌گرداند.

### Date Tools

- `convertDate(input: { date: { year: number; month: number; day: number }; from: 'jalali' | 'gregorian' | 'islamic'; to: 'jalali' | 'gregorian' | 'islamic' }): ToolResult<{ year: number; month: number; day: number }>`

**نمونه استفاده:**

```ts
import { convertDate } from 'persian-tools/date-tools';

const result = convertDate({
  date: { year: 1402, month: 11, day: 1 },
  from: 'jalali',
  to: 'gregorian',
});
// result.ok === true → result.data
```

**Edge cases:**

- اگر تاریخ معتبر نباشد، خروجی `ok: false` و `error.code` مرتبط بازگردانده می‌شود.

### Finance

- `calculateTax(amount: number, ratePercent: number): { baseAmount: number; ratePercent: number; taxAmount: number; totalWithTax: number }`
- `calculateCompoundInterest(input: { principal: number; annualRatePercent: number; years: number; timesPerYear?: number }): { principal: number; total: number; interest: number; annualRatePercent: number; years: number; timesPerYear: number }`
- `convertRialToToman(amountRial: number): number`
- `convertTomanToRial(amountToman: number): number`

**نمونه استفاده:**

```ts
import { calculateCompoundInterest, convertRialToToman } from 'persian-tools/finance';

const result = calculateCompoundInterest({
  principal: 10_000_000,
  annualRatePercent: 18,
  years: 2,
});
const toman = convertRialToToman(150_000); // 15000
```

### Validation

- `normalizeIranianMobile(input: string): string | null`
- `isValidIranianMobile(input: string): boolean`
- `isValidNationalId(input: string): boolean`
- `isValidCardNumber(input: string): boolean`
- `isValidIranianSheba(input: string): boolean`
- `isValidIranianPostalCode(input: string): boolean`
- `isValidIranianPlate(input: string): boolean`

**نمونه استفاده:**

```ts
import { isValidNationalId, normalizeIranianMobile } from 'persian-tools/validation';

isValidNationalId('0084575949'); // true/false
normalizeIranianMobile('+989121234567'); // "09121234567"
```

**Edge cases:**

- ورودی‌های نامعتبر همیشه `false` برمی‌گردانند یا `null` (برای normalize).

### Result

- `ok<T>(data: T): ToolResult<T>`
- `fail(message: string, code?: string, details?: unknown): ToolResult<never>`
- `fromError(error: unknown, fallbackMessage?: string, code?: string): ToolResult<never>`

**نمونه استفاده:**

```ts
import { ok, fail, fromError } from 'persian-tools';

const success = ok({ id: 1 });
const error = fail('ورودی نامعتبر است.', 'INVALID_INPUT');
const handled = fromError(new Error('Boom'), 'خطای عمومی');
```

---

## نکات پایداری API

- API عمومی از مسیر `shared/utils` صادر می‌شود.
- تغییرات ناسازگار باید با نسخه MAJOR منتشر شوند.
- در صورت نیاز به عملکرد سنگین، از lazy-load استفاده کنید.

## نمونه‌های واقعی داخل مخزن

- قرارداد خروجی `shared/utils` با تست پایدار کنترل می‌شود:
  - `tests/unit/exports.test.ts`
- lazy-load ماژول‌های سنگین PDF با import پویا و memoization انجام می‌شود:
  - `features/pdf-tools/lazy-deps.ts`
  - `features/pdf-tools/lazy-deps.test.ts`
- مصرف واقعی lazy-load در ابزارها:
  - `features/pdf-tools/convert/pdf-to-image.tsx`
  - `features/pdf-tools/convert/image-to-pdf.tsx`
  - `features/pdf-tools/security/decrypt-pdf.tsx`
