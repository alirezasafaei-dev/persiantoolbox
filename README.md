# 🛠️ جعبه ابزار فارسی (Persian Tools)

- آخرین به‌روزرسانی: 2026-02-06

<div align="center">

![Persian Tools](https://img.shields.io/badge/پارسی-ابزارهای%20فارسی-blue?style=for-the-badge)
![License](<https://img.shields.io/badge/لایسنس-MIT_(_v1.1.x_)-green?style=for-the-badge>)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

[🚀 شروع سریع](#-شروع-سریع) • [🧩 استفاده](#-استفاده-به-عنوان-کتابخانه) • [📚 API](#-مرجع-api) • [🤝 مشارکت](#-مشارکت)

</div>

## 📖 معرفی پروژه

**Persian Tools** یک مجموعه کامل از ابزارهای آنلاین فارسی‌زبان برای PDF، محاسبات مالی، پردازش متن و تصویر است. همه پردازش‌ها در مرورگر انجام می‌شوند تا **حریم خصوصی** و **امنیت داده‌ها** حفظ شود.

برای استانداردهای طراحی و فنی پروژه، سند `docs/project-standards.md` را مطالعه کنید.

### خلاصه استانداردها

- بدون وابستگی خارجی در runtime
- UI فارسی، RTL و فونت داخلی
- TypeScript strict + تست برای قابلیت‌های اصلی (حداقل پوشش ۸۵٪)
- رعایت دسترسی‌پذیری پایه (WCAG AA حداقلی)

---

## 📰 تغییرات اخیر (6 فوریه 2026)

- 🎯 CSP به‌روزشده: همه سرور اسکریپت‌های JSON-LD حالا با `proxy.ts` header `Content-Security-Policy` و `x-csp-nonce` ارسال می‌شوند تا `next/script` فقط با nonce اجرا شود.
- 🛡️ رضایت تبلیغات: از `AdsConsentBanner` برای مسدودسازی بنرهای تبلیغاتی تا زمان موافقت کاربر استفاده و همه تغییرات در `shared/consent/adsConsent.ts` ذخیره می‌شود.
- 📡 لینک‌دهی هوشمند ساختار‌دهی: داده‌های `ToolSeoContent`، صفحات موضوعی و `layout` اکنون همه داده‌های JSON-LD را از طریق `next/script` همراه با nonce inject می‌کنند.
- 🚦 پایش کیفیت: اسکریپت‌ها و تنظیمات Lighthouse CI اضافه شد (`start:prod`, `lighthouse`, `lighthouse:ci`, `lighthouserc.json`) و ورک‌فلو GitHub Actions برای اجرای خودکار روی push/PR موجود است.

## ✨ ویژگی‌ها

- 📄 **ابزارهای PDF**: ادغام، تقسیم، فشرده‌سازی، واترمارک، رمزگذاری، تبدیل
- 💰 **محاسبات مالی**: وام و حقوق
- 📅 **ابزارهای تاریخ**: تبدیل شمسی/میلادی، محاسبه سن، فاصله تاریخی
- 📝 **ابزارهای متنی**: تبدیل عدد به حروف، شمارش کلمات
- 🖼️ **ابزارهای تصویر**: فشرده‌سازی و پردازش در مرورگر

---

## 🧭 نقشه ویژگی‌ها

| دسته  | قابلیت‌ها                                                 | وضعیت |
| ----- | --------------------------------------------------------- | ----- |
| PDF   | ادغام، تقسیم، فشرده‌سازی، واترمارک، رمزگذاری، استخراج متن | کامل  |
| تصویر | فشرده‌سازی، تغییر اندازه، خروجی فرمت‌های رایج             | کامل  |
| تاریخ | تبدیل شمسی/میلادی، سن، اختلاف تاریخ، تعطیلات ثابت         | کامل  |
| متن   | تبدیل عدد به حروف، شمارش کلمات، نرمال‌سازی فارسی          | کامل  |
| مالی  | وام، حقوق، مالیات ساده، سود مرکب، تبدیل ریال/تومان        | کامل  |

---

## 🔒 حریم خصوصی و پردازش محلی

- تمام پردازش‌ها **در مرورگر** انجام می‌شوند و فایل‌ها از دستگاه خارج نمی‌شوند.
- هیچ سرویس خارجی برای عملکرد اصلی استفاده نمی‌شود.
- تحلیل‌گر فقط در صورت فعال‌سازی **self-host** اجرا می‌شود (`NEXT_PUBLIC_ANALYTICS_ID`).
- در صورت تنظیم `ANALYTICS_INGEST_SECRET`، ارسال و خواندن داده‌های تحلیل‌گر فقط با هدر
  `x-pt-analytics-secret` مجاز است.

---

## ⚠️ محدودیت‌ها

- OCR و تشخیص متن از تصویر در حال حاضر **پشتیبانی نمی‌شود**.
- فایل‌های بسیار بزرگ ممکن است به حافظه بیشتری نیاز داشته باشند.
- تعطیلات به صورت **داده‌های ثابت شمسی** ارائه می‌شوند (رویدادهای قمری در این نسخه لحاظ نشده‌اند).

---

## 🚀 شروع سریع

```bash
# نصب وابستگی‌ها
pnpm install

# اجرای محیط توسعه (Next 16)
pnpm dev

# ساخت نسخه تولیدی
pnpm build
```

نکته توسعه: برای جلوگیری از هشدارهای Next.js در دسترسی از `127.0.0.1`، گزینه
`allowedDevOrigins` در `next.config.mjs` تنظیم شده است.

### استقرار (Deployment)

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start -- --hostname 0.0.0.0 --port 3000
```

- متغیرهای ضروری: `DATABASE_URL` (در صورت نیاز به ویژگی اشتراک/تاریخچه)، `NEXT_PUBLIC_SITE_URL`.
- برای پنل ادمین درآمدزایی، `ADMIN_EMAIL_ALLOWLIST` را تنظیم کنید (ایمیل‌ها با `,` جدا شوند).
- اگر در production تحلیل‌گر را فعال می‌کنید (`NEXT_PUBLIC_ANALYTICS_ID`)، باید `ANALYTICS_INGEST_SECRET` هم ست شود.
- PWA و Service Worker در نسخه build فعال است؛ برای آپدیت کلاینت، `CACHE_VERSION` در `public/sw.js` را افزایش دهید.
- برای اجرای سرور پشت پروکسی، هدر `X-Forwarded-Proto` تنظیم شود.

### تست و کنترل کیفیت

```bash
pnpm ci:quick           # lint + typecheck + unit
pnpm test:e2e:ci        # E2E فقط کروم (headless)
```

استاندارد PR: همه تست‌ها باید سبز باشند و پوشش حداقل ابزارهای اصلی حفظ شود.

## 🗄️ پایگاه داده (SQL-first)

برای قابلیت‌های اشتراک و تاریخچه، PostgreSQL لازم است.

```bash
# اعمال schema روی دیتابیس
pnpm db:migrate
```

متغیر `DATABASE_URL` باید در محیط تنظیم شود (نمونه در `.env.example`).
schema مرجع در `scripts/db/schema.sql` نگهداری می‌شود.

---

## 🧭 نقشه‌راه توسعه

نقشه‌راه استاندارد و اجرایی پروژه در فایل `docs/roadmap.md` قرار دارد.
این نقشه‌راه به‌صورت **اولویت‌محور** نگهداری می‌شود:

- اولویت 1: پایداری Build/Install و یکپارچه‌سازی دیتابیس
- اولویت 2: امنیت و حریم خصوصی
- اولویت 3: کیفیت و CI/CD
- اولویت 4: تجربه کاربری و دسترس‌پذیری
- اولویت 5: SEO و PWA

---

## ⚖️ وضعیت لایسنس

- وضعیت فعلی ریپو تا نسخه‌های `v1.1.x`: `MIT` (فایل `LICENSE`)
- مسیر مهاجرت نسخه‌ای برای `v2.0.0+`: مدل `Dual License` (Non-Commercial + Commercial)
- برای جزئیات مهاجرت و تعریف دقیق سناریوهای تجاری:
  - `docs/licensing/license-migration-taskboard.md`
  - `docs/licensing/dual-license-policy.md`
  - `COMMERCIAL.md`

یادداشت واژگانی: پس از فعال‌سازی مدل Dual License، پروژه در تعریف OSI «Open Source» محسوب نمی‌شود و باید با عنوان `Source-available` معرفی شود.

---

## 💰 درآمدزایی و پایداری

- استراتژی درآمدزایی و اصول حریم خصوصی در `docs/monetization/strategy.md`
- نسخه اجرایی اولویت‌محور در `docs/monetization/roadmap.md`
- تسک‌های اجرایی اولویت‌بندی‌شده در `docs/monetization/task-plan.md`

## 🗂️ فهرست مستندات

برای مشاهده همه مستندات فنی و مدیریتی، فایل `docs/index.md` را ببینید.

<details>
  <summary>نمایش فهرست سریع مستندات</summary>

- استانداردها: `docs/project-standards.md`
- راهنمای توسعه: `docs/developer-guide.md`
- سیاست بازبینی: `docs/review-policy.md`
- عملیات: `docs/operations.md`
- API: `docs/api.md`
- نقشه راه: `docs/roadmap.md`
- نقشه استقرار: `docs/deployment-roadmap.md`
- چک‌لیست روزانه: `docs/daily-checklist.md`
- ممیزی: `docs/technical-audit.md`
- خلاصه ممیزی: `docs/technical-audit-summary.md`
- درآمدزایی: `docs/monetization/`
- بورد گرافیکی: `docs/roadmap-board.html`
- بورد داخلی: `/roadmap-board`
- نقشه استقرار: `docs/deployment-roadmap.html`
- نقشه استقرار داخلی: `/deployment-roadmap`
</details>

---

## 📴 استفاده آفلاین / PWA

- این پروژه از Service Worker برای حالت آفلاین استفاده می‌کند.
- برای نصب روی موبایل یا دسکتاپ، گزینه **Add to Home Screen** را در مرورگر انتخاب کنید.
- فایل `public/sw.js` و `app/manifest.ts` مسیرهای اصلی PWA هستند.
- چرخه به‌روزرسانی: وقتی نسخه جدید Service Worker آماده باشد، بنر «نسخه جدید جعبه‌ابزار آماده است» در صفحه ظاهر می‌شود. با انتخاب «بروزرسانی و بارگذاری مجدد» کش‌های قدیمی پاک و نسخه جدید فعال می‌شود.
- دیباگ به‌روزرسانی در محیط توسعه: می‌توانید با پیام `DEBUG_FORCE_UPDATE` به SW، بنر را شبیه‌سازی کنید؛ تست E2E مرتبط در `tests/e2e/offline.spec.ts` موجود است.

---

## 🔍 SEO و OG Assets

- صفحات موضوعی و Pillar در مسیر `/topics` قرار دارند.
- تصاویر OpenGraph ابزارهای مهم به‌صورت خودکار تولید می‌شوند:

```bash
pnpm generate:og
```

- در `pnpm build`، تولید OG به‌صورت خودکار اجرا می‌شود.

---

## 🧩 استفاده به عنوان کتابخانه

این پروژه علاوه بر اپلیکیشن، یک **کتابخانه TypeScript** برای ابزارهای عددی و فارسی‌سازی ارائه می‌دهد.

### نصب

```bash
pnpm add persian-tools
```

### مثال (Node.js)

```ts
import { parseLooseNumber, numberToWordsFa } from 'persian-tools';

const parsed = parseLooseNumber('۱۲٬۳۴۵٫۶۷');
const words = numberToWordsFa(parsed ?? 0);

console.log(parsed); // 12345.67
console.log(words); // دوازده هزار و سیصد و چهل و پنج ممیز شش هفت
```

### مثال (Browser - ESM)

```ts
import { toPersianNumbers, formatPersianDate } from 'persian-tools';

console.log(toPersianNumbers('Invoice 2024')); // Invoice ۲۰۲۴
console.log(formatPersianDate(new Date()));
```

### مثال (تاریخ و نرمال‌سازی متن)

```ts
import { convertDate, cleanPersianText } from 'persian-tools';

const result = convertDate({
  from: 'jalali',
  to: 'gregorian',
  date: { year: 1403, month: 1, day: 1 },
});

if (result.ok) {
  console.log(result.data);
}

console.log(cleanPersianText('  كتابها  ')); // کتاب‌ها
```

### مثال (مالی)

```ts
import { calculateCompoundInterest, convertTomanToRial } from 'persian-tools';

const r = calculateCompoundInterest({
  principal: 1_000_000,
  annualRatePercent: 18,
  years: 2,
  timesPerYear: 12,
});

console.log(r.total);
console.log(convertTomanToRial(150_000));
```

---

## 📚 مرجع API

کتابخانه NPM در مسیرهای زیر در دسترس است (هر مسیر ESM/CJS + d.ts):

- `persian-tools` (کل API)
- `persian-tools/numbers`
- `persian-tools/localization`
- `persian-tools/validation`
- `persian-tools/finance`
- `persian-tools/date-tools`

نمونه وارد کردن ماژول تفکیک‌شده:

```ts
import { toEnglishDigits, numberToWordsFa } from 'persian-tools/numbers';
import { formatPersianCurrency } from 'persian-tools/localization';
import { convertDate } from 'persian-tools/date-tools';
```

خلاصه امضاها (اطلاعات کامل در `docs/api.md` و خروجی Typedoc در `docs/api/`):

```ts
// numbers
export function toEnglishDigits(input: string): string;
export function parseLooseNumber(input: string): number | null;
export function formatNumberFa(n: number): string;
export function formatMoneyFa(n: number): string;
export function numberToWordsFa(input: number): string;

// localization (Persian)
export function toPersianNumbers(input: string | number): string;
export function formatPersianNumber(num: number): string;
export function formatPersianCurrency(amount: number, currency?: string): string;
export function rtlAttributes(): { dir: 'rtl'; 'aria-orientation': 'horizontal' };
export function isPersianText(text: string): boolean;
export function formatPersianDate(date: Date | number): string;
export function fixPersianSpacing(text: string): string;
export function normalizePersianChars(text: string): string;
export function stripPersianDiacritics(text: string): string;
export function cleanPersianText(text: string): string;
export function convertDate(input: {
  date: { year: number; month: number; day: number };
  from: 'jalali' | 'gregorian';
  to: 'jalali' | 'gregorian';
}):
  | { ok: true; data: { year: number; month: number; day: number } }
  | { ok: false; error: { code: string; message: string } };
export type ToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

// finance
export function calculateTax(
  amount: number,
  ratePercent: number,
): {
  baseAmount: number;
  ratePercent: number;
  taxAmount: number;
  totalWithTax: number;
};
export function calculateCompoundInterest(input: {
  principal: number;
  annualRatePercent: number;
  years: number;
  timesPerYear?: number;
}): {
  principal: number;
  total: number;
  interest: number;
  annualRatePercent: number;
  years: number;
  timesPerYear: number;
};
export function convertRialToToman(amountRial: number): number;
export function convertTomanToRial(amountToman: number): number;
```

### مستندات خودکار

```bash
pnpm docs:api
```

خروجی در مسیر `docs/api` تولید می‌شود.

---

## 🧪 تست‌ها و کیفیت

```bash
pnpm lint
pnpm typecheck
pnpm test:ci
pnpm bench          # بنچمارک عددی
```

> نکته: Storybook فعلی روی نسخه 9 آلفا (سازگار با Next 16) اجرا می‌شود و ممکن است هشدار peer در محیط توسعه نمایش دهد.

---

## 🧠 معماری پروژه

- `app/` مسیرهای اپلیکیشن (Next.js App Router)
- `features/` منطق و UI ابزارها
- `shared/` ماژول‌های عمومی (utilities، UI، خطاها)
- `examples/` نمونه‌های کاربردی

---

## 🤝 مشارکت

لطفاً [CONTRIBUTING.md](CONTRIBUTING.md) را مطالعه کنید.

---

## 📄 لایسنس

این پروژه تحت لایسنس **MIT** منتشر شده است.
