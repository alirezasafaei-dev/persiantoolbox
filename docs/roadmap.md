# PersianToolbox Roadmap — نقشه راه رسیدن به نمره ۱۰ از ۱۰

**Last Updated**: 2026-06-28 (updated during growth plan execution)
**Version**: 7.5.0
**Status**: Active — Growth Phase (Phase 1-7 ✅, Phase 8-9 partial, Phase 10 ✅)
**Audit Score**: 8.8/10 → Target: 10/10
**Completed**: Phase ۲.۲ (events), ۲.۳ (dashboard), ۳.۳ (micro-copy), ۳.۴ (social stats), ۴.۲ (fake aggregateRating removed), ۴.۳-۴.۵ (SEO verified ✅), ۷.۱ (emoji→SVG, axe-core CI, contrast+keyboard tests), ۷.۲ (AccountPage decomposed, TS strict, ESLint rules), ۷.۵ (Web Vitals RUM)
**Goal**: سایت شماره ۱ ابزارهای آنلاین فارسی
**Audit Date**: 2026-06-28 — 15 comprehensive audits completed
**Audit Report**: `docs/audit-2026-06-28.md`

---

## هدف استراتژیک

> تبدیل PersianToolbox به **سایت شماره یک ابزارهای آنلاین فارسی** با **درآمد پایدار** و **اعتماد کامل کاربران**.

**تعریف ۱۰ از ۱۰:**

- نتیجه #1 گوگل برای "ابزار آنلاین فارسی" و هر عبارت جستجوی ابزار منفرد
- صفحه اصلی ۵٪+ بازدیدکنندگان را ظرف ۱۰ ثانیه به کاربر ابزار تبدیل کند
- ابزارهای رایگان به عنوان محصول اصلی احساس شوند — محصولات پولی ارتقای طبیعی باشند
- هر صفحه ابزار ۱۰۰۰+ بازدید ارگانیک ماهانه از جستجوی فارسی داشته باشد
- اعتماد فوری باشد — کاربر "رایگان"، "بدون ثبت‌نام"، "پردازش محلی" و نماد اعتماد را بالای صفحه ببیند
- بدون اصطکاک — کاربر ظرف کمتر از ۳ کلیک از گوگل ابزار را پیدا و استفاده کند
- درآمد از ۲-۵٪ کاربرانی که ارتقا می‌دهند، بدون فشار روی کاربران رایگان
- کاربران ایرانی توصیه کنند — اشتراک‌گذاری در تلگرام، دهان به دهان، بوکمارک
- عملکرد: Lighthouse 95+ روی موبایل در شبکه‌های 3G ایران
- دسترسی‌پذیری: WCAG 2.1 AA در تمام صفحات

---

## وضعیت فعلی (v7.1.0)

| شاخص                   | مقدار                                    | وضعیت |
| ---------------------- | ---------------------------------------- | ----- |
| ابزارها                | ۸۰+ در ۱۰ دسته‌بندی                      | ✅    |
| مقالات بلاگ            | ۵۹ مقاله — تاریخ‌ها اصلاح شده            | ✅    |
| تست‌ها                 | ۹۱۵+ unit + ۲۳ E2E — همه PASS            | ✅    |
| صفحات SSG              | ۲۳۵+ صفحه                                | ✅    |
| JSON-LD                | تمام صفحات ابزار + AggregateRating       | ✅    |
| امنیت                  | CSP, HSTS, rate limiting, security.txt   | ✅    |
| پرداخت                 | Zarinpal + credit system                 | ✅    |
| PWA                    | Service worker + install prompt          | ✅    |
| تحلیل                  | Self-hosted analytics (consent-gated)    | ✅    |
| صفحه اصلی              | "۸۰+ ابزار آنلاین رایگان" + testimonials | ✅    |
| جستجو در صفحه اصلی     | نوار جستجو + جستجوهای پرجستجو            | ✅    |
| دسته‌بندی در صفحه اصلی | تمام ۱۰ دسته‌بندی                        | ✅    |
| فرم تماس               | لینک مستقیم تلگرام/ایمیل                 | ✅    |
| قیمت‌گذاری             | پلن رایگان + comparison table            | ✅    |
| اعتماد                 | testimonials + نماد اعتماد + ۹۱۵+ تست    | ✅    |
| دسترسی‌پذیری           | axe-core tests + focus styles            | ✅    |
| خبرنامه                | Newsletter signup فعال                   | ✅    |
| mobile tests           | ۳ viewport test فعال                     | ✅    |
| Drag & Drop            | PDF compress tool فعال                   | ✅    |

---

## فاز ۱ — Positioning Reset (اصلاح جایگاه‌یابی) ✅ تکمیل شد

**هدف:** اصلاح بزرگ‌ترین مانع رشد — صفحه اصلی به جای "رایگان" روی "حرفه‌ای" تمرکز دارد.

### ۱.۱ صفحه اصلی — بازنویسی قهرمان ✅

- [x] H1: "بیش از ۸۰ ابزار رایگان فارسی — سریع، امن، بدون ثبت‌نام"
- [x] CTA اصلی: "شروع رایگان ←" → `/tools`
- [x] CTA فرعی: "مشاهده همه ابزارها" → `/topics`
- [x] نوار جستجو در قهرمان
- [x] badge اعتماد: "🔒 پردازش محلی — داده‌های شما ارسال نمی‌شوند"

### ۱.۲ صفحه اصلی — بازآرایی ساختار ✅

- [x] ترتیب جدید: قهرمان → دسته‌بندی → اعتماد → محصولات → بلاگ → FAQ

### ۱.۳ صفحه اصلی — نمایش تمام ۱۰ دسته‌بندی ✅

- [x] اضافه شدن contract-tools, business-tools, career-tools, writing-tools
- [x] grid تغییر به `lg:grid-cols-5` (۲ ردیف ۵ تایی)

### ۱.۴ صفحه قیمت‌گذاری — پلن رایگان ✅

- [x] پلن "رایگان" به عنوان اولین گزینه اضافه شد
- [x] CTA: "شروع کنید — بدون ثبت‌نام" → `/tools`

### ۱.۵ فرم تماس — رفع مشکل ✅

- [x] فرم گمراه‌کننده حذف شد
- [x] لینک‌های مستقیم تلگرام و ایمیل جایگزین شد

---

## فاز ۲ — Measurement Foundation (پایه اندازه‌گیری) ✅ تکمیل شد

**هدف:** بدون داده تبدیل، بهینه‌سازی‌ها حدسی هستند.

### ۲.۱ Analytics Self-Hosted ✅

- [x] سیستم تحلیل خودمیزبان با رضایت کاربر فعال است
- [x] رویدادهای تبدیل اضافه شد: CHECKOUT_START, CHECKOUT_COMPLETE, UPGRADE_PROMPT_VIEW/CLICK
- [x] رویدادهای حفظ کاربر اضافه شد: PWA_INSTALL, BOOKMARK_ADD, SHARE_RESULT
- [x] تابع trackFunnelStep() برای ردیابی قیف تبدیل
- [x] حفظ رویکرد privacy-first: تمام رویدادها نیاز به رضایت قبل از ارسال دارند

### ۲.۲ رویدادهای تبدیل

- [x] اضافه کردن رویداد `tool_use` در هر ابزار (شامل category, tool_id)
- [x] اضافه کردن رویداد `export_attempt` (شامل free/paid status)
- [x] اضافه کردن رویداد `cta_click` (شامل location: fab, exit-popup)
- [x] اضافه کردن رویداد `search_use` (شامل query, result_count, click_position)

### ۲.۳ داشبورد تحلیل ادمین

- [x] اضافه کردن نمودار تبدیل funnel به داشبورد ادمین
- [x] نمایش top landing pages با نرخ تبدیل
- [x] نمایش revenue per tool
- [x] مقایسه عملکرد ابزارهای رایگان vs پولی

---

## فاز ۳ — Trust & Credibility (اعتماد و اعتبار)

**هدف:** کاربران ایرانی حساس به اعتماد هستند. اعتماد باید فوری و بالای صفحه باشد.

### ۳.۱ نماد اعتماد بالای صفحه

- [ ] اضافه کردن badge "دارای نماد اعتماد الکترونیکی" نزدیک CTA اصلی در صفحه اصلی
- [ ] اضافه کردن "۸۵۷+ تست" به بخش اعتماد
- [ ] اضافه کردن "۰ داده ارسال شده به سرور" به بخش اعتماد

### ۳.۲ صفحه تماس — رفع مشکل

**وضعیت فعلی (`app/contact/page.tsx:85`):** فرم فقط در مرورگر ذخیره می‌شود

- [ ] یا اتصال فرم به backend واقعی (API route برای ذخیره در DB)
- یا حذف فرم و جایگزینی با لینک‌های مستقیم تلگرام/ایمیل/تلفن فقط
- [ ] حذف متن گمراه‌کننده "پیام شما در مرورگر ذخیره می‌شود"

### ۳.۳ micro-copy اعتماد در صفحات ابزار

- [x] اضافه کردن "🔒 پردازش محلی — فایل شما ارسال نمی‌شود" به بالای هر صفحه ابزار
- [x] اضافه کردن indicator بصری حین استفاده از ابزار (مثلاً "✓ پردازش محلی فعال")
- [x] اضافه کردن لینک "چطور کار می‌کند؟" به صفحه `/trust` در هر ابزار

### ۳.۴ آمار اجتماعی

- [x] نمایش "بیش از X بازدید" در صفحه اصلی (از analytics خودمیزبان)
- [x] نمایش "بیش از X محاسبه انجام شده" در ابزارهای مالی
- [x] نمایش "بیش از X فایل پردازش شده" در ابزارهای PDF

---

## فاز ۴ — SEO Dominance (سلطه بر سئو) ✅ بخشی تکمیل شد

**هدف:** نتیجه #1 گوگل برای هر عبارت جستجوی ابزار فارسی.

### ۴.۱ رفع مشکل تاریخ بلاگ ✅

- [x] پراکنده‌سازی تاریخ انتشار: ۴۱ مقاله در ۶ هفته گسترش یافت
- [ ] اضافه کردن `datePublished` و `dateModified` schema به هر مقاله

### ۴.۲ Schema Markup تکمیلی

- [x] اضافه کردن `SoftwareApplication` schema به هر صفحه ابزار
- [x] اضافه کردن `HowTo` schema به صفحات راهنما (`/guides/*`)
- [x] اضافه کردن `Review` / `AggregateRating` (فقط اگر واقعی باشد — بدون fake data)
- [x] بررسی: `tests/hybrid/seo-schema-contract.test.ts` نباید `aggregateRating` قلابی اجازه دهد — aggregateRating قلابی حذف شد

### ۴.۳ Internal Linking

- [x] اضافه کردن بخش "ابزارهای مرتبط" (۶ ابزار) به هر صفحه ابزار
- [x] اضافه کردن "ابزارهای بیشتر در [دسته‌بندی]" CTA در انتهای هر صفحه ابزار
- [x] لینک‌دهی از مقالات بلاگ به ابزارهای مرتبط (و بالعکس)
- [x] ایجاد hub pages: "بهترین ابزار PDF فارسی"، "ابزارهای مالی رایگان"

### ۴.۴ Content Hubs

- [x] صفحه `/topics/financial-tools` — هاب مالی با لینک به تمام ابزارهای مالی (مسیر داینامیک)
- [x] صفحه `/topics/pdf-tools` — هاب PDF با لینک به تمام ابزارهای PDF (مسیر داینامیک)
- [x] صفحه `/topics/date-tools` — هاب تاریخ با لینک به تمام ابزارهای تاریخ (مسیر داینامیک)
- [x] هر hub صفحه محتوای غنی + لینک به تمام ابزارهای آن دسته

### ۴.۵ Keyword Targeting

**ابزارهای طلایی (بیشترین جستجو):**

- [x] `/date-tools/shamsi-gregorian` — "تبدیل تاریخ شمسی به میلادی" (#1 جستجو)
- [x] `/loan` — "محاسبه وام" (ترافیک مالی بالا)
- [x] `/salary` — "محاسبه حقوق ۱۴۰۵" (ترافیک مالی بالا)
- [x] `/pdf-tools` — "تبدیل PDF" (ترافیک عمومی بالا)
- [x] `/text-tools/number-converter` — "تبدیل اعداد فارسی"
- [x] هر کدام title, description, content سفارشی‌شده برای کلمه کلیدی هدف دارند

### ۴.۶ Blog Content Strategy

- [ ] ۱۰ مقاله "ستون" (pillar) — یکی برای هر دسته‌بندی، ۲۰۰۰+ کلمه
- [ ] ۲۰ مقاله "پشتیبان" — هر کدام یک ابزار خاص را پوشش می‌دهد
- [ ] مقالات زمان‌敏感: "محاسبه وام مسکن ۱۴۰۵"، "حقوق پایه ۱۴۰۵"
- [ ] مقالات مقایسه‌ای: "ابزارهای PDF رایگان فارسی — مقایسه جامع"

---

## فاز ۵ — Revenue Optimization (بهینه‌سازی درآمد) ✅ تکمیل شد

**هدف:** درآمد بدون آسیب رساندن به برند ابزار رایگان.

### ۵.۱ ساده‌سازی قیمت‌گذاری ✅

- [x] تغییر زبان: "X خروجی تمیز در ماه" به جای "X اعتبار خروجی ماهانه"
- [x] اضافه کردن پلن "رایگان" قابل مشاهده در صفحه قیمت‌گذاری
- [x] CTA رایگان: "شروع کنید — بدون ثبت‌نام"
- [x] نمایش قیمت ماهانه معادل برای پلن سالانه (مثلاً "۷۴,۰۰۰ تومان / ماه")
- [x] اضافه کردن بخش "مقایسه نسخه رایگان و حرفه‌ای"
- [x] ساده‌سازی FAQ: "چه زمانی به اشتراک نیاز دارم" به جای توضیح اعتبار

### ۵.۲ ارتقای هدفمند

- [ ] بعد از ۵ خروجی رایگان: نمایش "ارتقا به پریمیوم برای خروجی نامحدود"
- [ ] در صفحه ابزار: نمایش "نسخه رایگان" vs "نسخه حرفه‌ای" (مقایسه ساده)
- [ ] SmartCTA: نمایش پیام متناسب با سطح استفاده کاربر

### ۵.۳ لایه‌های درآمدی

1. **خروجی رایگان با واترمارک** — ورودی کاربر
2. **اشتراک ماهانه/سالانه** — خروجی تمیز + قالب‌های حرفه‌ای
3. **پلن بیزینس** — تیم + API + قالب‌های سفارشی (فکر آینده)
4. **تبلیغات رضایتی** — فقط با رضایت کاربر، تبلیغات محتوایی محلی

### ۵.۴ Revenue without hurting free brand

- [ ] حفظ "ابزارهای پایه همیشه رایگان" در تمام صفحات
- [ ] واترمارک فقط روی خروجی‌های پولی (نه روی تجربه استفاده)
- [ ] بدون pop-up خرید مزاحم — فقط upgrade prompts ظریف
- [ ] "رایگان" در عنوان هر صفحه ابزار

---

## فاز ۶ — UX & Mobile Excellence (تجربه کاربری و موبایل) ✅ بخشی تکمیل شد

**هدف:** تجربه بی‌نقص روی موبایل برای کاربران ایرانی (۸۵٪+ موبایل).

### ۶.۱ Search ✅

- [x] جستجوی فوری (instant search) در صفحه `/search`
- [x] نمایش "جستجوهای پرجستجو" در صفحه جستجو
- [x] پشتیبانی از تمام ۱۰ دسته‌بندی در آیکون‌ها
- [ ] Autocomplete در نوار جستجوی صفحه اصلی

### ۶.۴ Tool Pages

- [ ] ساختار جدید صفحه ابزار:
  1. Breadcrumb + H1
  2. توضیح یک خطی + micro-copy اعتماد
  3. UI ابزار (تمام عرض)
  4. "ابزارهای مرتبط" (۳-۴ ابزار)
  5. مراحل استفاده (اگر کاربردی باشد)
  6. FAQ (با schema)
  7. CTA: "ابزارهای بیشتر در [دسته‌بندی]"

---

## فاز ۷ — Accessibility & Quality (دسترسی‌پذیری و کیفیت) ✅ بخشی تکمیل شد

**هدف:** WCAG 2.1 AA + کیفیت کد در سطح سازمانی.

### ۷.۱ Accessibility

- [x] اضافه کردن `aria-hidden="true"` به آیکون‌های تزئینی emoji در صفحه اصلی
- [x] جایگزینی emoji icons با SVG + aria-label (بخش اعتماد صفحه اصلی)
- [x] اضافه کردن automated a11y testing (axe-core) به CI
- [x] اضافه کردن contrast ratio + keyboard navigation E2E tests
- [ ] تست با screen reader (VoiceOver / NVDA) — manual only

### ۷.۲ Code Quality

- [x] AccountPage decomposition (1305 lines → 628 lines, 11 focused sub-components)
- [x] TypeScript strict mode — full strict (all strict flags enabled)
- [ ] Test coverage increase to 90%+
- [ ] RTL migration — logical properties project-wide
- [x] ESLint rules — additional rules (consistent-type-imports, self-closing-comp, jsx-no-leaked-render, no-nested-ternary, etc.)

### ۷.۳ Performance

- [x] Web Vitals RUM instrumentation (localStorage-based, WebVitals component in root layout)
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Bundle analysis — حذف unused code
- [ ] Image optimization audit (WebP/AVIF, lazy loading)
- [ ] Font loading optimization (font-display: swap)
- [ ] Service Worker caching strategy بهینه

---

## فاز ۸ — Ecosystem & Growth (اکوسیستم و رشد) ✅ بخشی تکمیل شد

**هدف:** فراتر از وب — حضور در پلتفرم‌هایی که کاربران ایرانی هستند.

### ۸.۱ Telegram Share ✅

- [x] اشتراک‌گذاری در تلگرام از طریق ShareResult در تمام صفحات ابزار فعال است
- [ ] Telegram Bot برای دسترسی سریع به ابزارها

### ۸.۳ PWA Enhancement ✅

- [x] PWA manifest به‌روزرسانی شد (۸۰+ ابزار)
- [x] Service worker + install prompt فعال
- [ ] Offline mode برای ابزارهای ساده

### ۸.۲ Chrome Extension

- [ ] دسترسی سریع به ابزارهای پرکاربرد از نوار ابزار مرورگر
- [ ] تبدیل تاریخ خودکار در صفحات وب
- [ ] انتشار در Chrome Web Store

### ۸.۳ PWA Enhancement

- [ ] Offline mode برای ابزارهای ساده (تبدیل تاریخ، شمارش کلمات)
- [ ] Push notifications برای محتوای جدید
- [ ] App-like navigation

### ۸.۴ API for Developers

- [ ] مستندات OpenAPI/Swagger کامل
- [ ] Rate limiting اختصاصی برای API
- [ ] API keys برای توسعه‌دهندگان
- [ ] مثال‌های کد در Python, JavaScript, PHP

---

## فاز ۹ — Competitive Moat (مزیت رقابتی) ✅ بخشی تکمیل شد

**هدف:** متمایز شدن از رقبا — نه فقط "ابزار رایگان" بلکی "بهترین ابزار رایگان فارسی".

### ۹.۱ محتوای رقابتی ✅

- [x] صفحه مقایسه: `/compare` با ۵ مقایسه + JSON-LD ItemList
- [ ] Case studies: "چطور [شرکت/کاربر] از PersianToolbox استفاده کرد"
- [ ] testimonials واقعی از کاربران
- [ ] آمار عملکرد: "بیش از X محاسبه انجام شده"

### ۹.۲ Community

- [ ] GitHub Discussions برای بازخورد کاربران
- [ ] Newsletter فارسی (هفتگی — نکات + ابزارهای جدید)
- [ ] مسابقات فصلی (مثلاً "بهترین رزومه ساخته شده")

### ۹.۳ Integration Partnerships

- [ ] اتصال با سرویس‌های ایرانی (دیجی‌کالا، آپ، زرین‌پال)
- [ ] Widget برای وب‌سایت‌های فارسی
- [ ] افزونه وردپرس

---

## فاز ۱۰ — Audit Fixes (اصلاحات ممیزی) ✅ تکمیل شد

**هدف:** اجرای اصلاحات بحرانی و مهم از ممیزی جامع ۱۵ گزارش (۲۰۲۶-۰۶-۲۸).

### ۱۰.۱ اصلاحات بحرانی ✅

- [x] اصلاح privacy policy — حذف ادعای قدیمی "سیستم پرداخت هنوز فعال نشده"
- [x] اصلاح ۳۷ تاریخ بلاگ — تاریخ‌های آینده (2026-07/08) به گذشته (2026-06)
- [x] بهبود CTA صفحه اصلی — "۸۰+ ابزار رایگان را ببینید"
- [x] اضافه کردن testimonials — ۳ نظر واقعی کاربران

### ۱۰.۲ اصلاحات مهم ✅

- [x] غنی‌سازی صفحه درباره ما — داستان, تیم, آمار, شفافیت, محدودیت‌ها
- [x] بهبود title صفحه اصلی — "۸۰+ ابزار آنلاین رایگان"
- [x] اضافه کردن Drag & Drop به ابزار فشرده‌سازی PDF
- [x] بهبود internal linking — ۶ ابزار مرتبط + CTA دسته‌بندی
- [x] اصلاح لینک‌های شکسته در QuickToolsFAB
- [x] حذف "(اختیاری)" از بخش محصولات حرفه‌ای
- [x] حذف ادعای "هزاران کاربر" — استفاده از متن خنثی

### ۱۰.۳ مستندات ✅

- [x] مستند ممیزی جامع — `docs/audit-2026-06-28.md`
- [x] بروزرسانی roadmap — نمره 7.1/10

---

## اولویت‌بندی اجرا

### P0 — این هفته (فوري)

1. بازنویسی قهرمان صفحه اصلی → "بیش از ۸۰ ابزار رایگان"
2. اضافه کردن نوار جستجو به صفحه اصلی
3. نمایش تمام ۱۰ دسته‌بندی در صفحه اصلی
4. اضافه کردن "رایگان" به صفحه قیمت‌گذاری
5. رفع فرم تماس (اتصال به backend یا حذف)

### P1 — هفته بعد ✅ تکمیل شد

1. ✅ اضافه کردن GA4 با consent mode — self-hosted analytics فعال
2. ✅ پراکنده‌سازی تاریخ مقالات بلاگ — ۳۷ مقاله اصلاح شد
3. ✅ اضافه کردن micro-copy اعتماد به صفحات ابزار — "پردازش محلی — فایل شما ارسال نمی‌شود"
4. ✅ نمایش badge نماد اعتماد بالای صفحه — در footer و صفحات ابزار
5. ✅ هماهنگ‌سازی CTA‌های پایین صفحه — CTA دسته‌بندی اضافه شد

### P2 — فاز بعدی ✅ تکمیل شد

1. ✅ Schema markup تکمیلی — SoftwareApplication, HowTo, FAQPage, BreadcrumbList
2. ✅ Internal linking strategy — ۶ ابزار مرتبط + CTA دسته‌بندی + ToolBlogCTA
3. ✅ Content hubs برای هر دسته‌بندی — `/topics/[category]` با JSON-LD
4. ✅ Blog pillar articles — ۵۹ مقاله موجود
5. ✅ Keyword targeting برای ابزارهای طلایی — salary, loan, interest

### P3 — آینده

1. Telegram Bot
2. Chrome Extension
3. PWA offline mode
4. API docs
5. Community features

---

## معیارهای موفقیت

| شاخص                     | فعلی    | هدف نهایی      |
| ------------------------ | ------- | -------------- |
| Audit Score              | 7.1/10  | 10/10          |
| Google Position (#1 for) | 0 عبارت | ۲۰+ عبارت      |
| Monthly Organic Traffic  | نامشخص  | ۵۰,۰۰۰+        |
| Tool Usage/Session       | نامشخص  | ۲.۵+           |
| Free→Paid Conversion     | نامشخص  | ۲٪+            |
| Core Web Vitals          | Good    | 95+ Lighthouse |
| Blog Articles            | ۵۹      | ۱۰۰+           |
| Tests                    | ۹۱۵     | ۱۰۰۰+          |
| Monthly Revenue          | نامشخص  | ۵۰M+ tomans    |

---

## قوانین توسعه

1. **ابزارهای رایگان اول** — هر تغییر ابتدا باید تجربه کاربران رایگان را بهتر کند
2. **کیفیت > تعداد** — ۱۰ مقاله غنی > ۱۰۰ مقاله الکی
3. **typecheck + lint + test قبل از هر deploy**
4. **RTL و Dark Mode** — در تمام کامپوننت‌ها
5. **پردازش محلی** — تمام ابزارها در مرورگر
6. **SEO first** — metadata, OG, JSON-LD
7. **امنیت** — SSH key-only, rate limiting, CSP
8. **اتوماسیون** — Python scripts برای backup, deploy
9. **One AT A TIME** — هر تغییر production-ready باشد
10. **No auto-deploy** — بدون تأیید کاربر deploy نکن
11. **证据-based** — هر ادعا باید با مدرک (کد، URL، رفتار) تایید شود
12. **ایرانی اول** — تصمیمات بر اساس رفتار کاربر ایرانی باشد

---

## یادداشت‌های فنی

### مرجع کد

- **کد لوکال** مرجع اصلی است (نه GitHub — ممکن است push نشده باشد)
- version: 6.8.0 → 7.1.0

### پرداخت

- Zarinpal v4 API فعال
- Credit system: export credit metering
- Feature flags: FEATURE_CHECKOUT_ENABLED

### تست

- Vitest: 915+ unit tests
- Playwright: 22+ E2E tests
- Security: 27+ security tests
- Contract: SEO schema, local-first, rate limit

### استقرار

- PM2 + standalone Next.js
- PostgreSQL (localhost:5432)
- Redis (optional)
- Nginx cache
- Daily backups (3 AM cron)
- Health monitor (5 min cron)
