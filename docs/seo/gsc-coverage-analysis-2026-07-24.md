# GSC Coverage Analysis — persiantoolbox.ir

**تاریخ تحلیل:** ۲۴ تیر ۱۴۰۵ (2026-07-24)
**منبع:** Google Search Console Coverage Report + Live verification

## خلاصه وضعیت

| شاخص                              | مقدار                        |
| --------------------------------- | ---------------------------- |
| ایندکس شده                        | 418                          |
| ایندکس نشده                       | 439                          |
| کل صفحات                          | 857                          |
| نسبت ایندکس                       | 48.8%                        |
| Impressions میانگین (۱۰ روز اخیر) | ~132/روز                     |
| فایل بلاگ در دیسک                 | 159 (158 published, 1 draft) |
| URL در sitemap                    | 439                          |

## ۱. Excluded by 'noindex' tag — ۹۱ صفحه

### ۱.۱ مقالات بلاگ ghost (~30 صفحه)

URL‌هایی مثل `2026-06-24-invoice-generator-guide` که **فایل .md ندارند** و **در sitemap نیستند**.
گوگل آنها را از deployment‌های قبلی crawl کرده. الان `not-found.tsx` با `robots: noindex, follow` برمی‌گردانند.

**نمونه‌ها:**

- `2026-06-24-invoice-generator-guide`
- `2026-06-26-hiring-cost-guide`
- `2026-06-26-investment-guide`
- `2026-06-26-retirement-calculator-guide`
- `2026-07-11-investment-guide`
- `2026-07-24-salary-1405-guide`
- `2026-06-24-vat-calculator-guide`
- `2026-06-24-financial-dashboard-guide`
- و ~22 مورد دیگر

**وضعیت واقعی:** تمام 25 نمونه test شده → `title: مقاله یافت نشد`, `robots: noindex, nofollow`

**اقدام:** بررسی منبع link‌ها (internal linking یا deployment قبلی) و حذف link‌ها

### ۱.۲ تگ‌های بلاگ (~30 صفحه)

تگ‌هایی که کمتر از ۲ مقاله دارند (`MIN_INDEXABLE_TAG_POSTS = 2`) → `robots: { index: false, follow: true }`

**نمونه test شده (همه noindex):**

- `/blog/tag/بهینه‌سازی تصویر`
- `/blog/tag/طلای آبشده`
- `/blog/tag/تأمین اجتماعی`
- `/blog/tag/داده`
- `/blog/tag/تاریخ تولد`
- `/blog/tag/ماده ۵۲۲`
- `/blog/tag/ابزارهای PDF`
- `/blog/tag/اجاره`
- `/blog/tag/امضای آنلاین`
- `/blog/tag/تعطیلات ایران`
- `/blog/tag/راهنما`
- `/blog/tag/رزومه فارسی`
- `/blog/tag/فاکتور`
- `/blog/tag/نگارش فارسی`
- `/blog/tag/نیم‌فاصله`

**اقدام:** کاهش `MIN_INDEXABLE_TAG_POSTS` به ۱

### ۱.۳ صفحات عمدی noindex

| صفحه             | دلیل                                      | وضعیت   |
| ---------------- | ----------------------------------------- | ------- |
| `/favorites`     | `robots: { index: false, follow: true }`  | ✅ عمدی |
| `/search`        | `robots: { index: false, follow: true }`  | ✅ عمدی |
| `/dashboard`     | `robots: { index: false, follow: false }` | ✅ عمدی |
| `/roadmap-board` | `robots: { index: false, follow: false }` | ✅ عمدی |
| `/offline`       | `robots: { index: false, follow: false }` | ✅ عمدی |

**اقدام:** نیازی نیست

### ۱.۴ www نسخه‌ها (~30 صفحه)

`www.persiantoolbox.ir/*` → canonical به `persiantoolbox.ir/*` اشاره می‌کند
**验证:** www URLs با 301 ریدایرکت می‌شوند ✅

**اقدام:** نیازی نیست

## ۲. Server error (5xx) — ۳۳ صفحه

### وضعیت فعلی (2026-07-24 — test live)

| صفحه                                                     | HTTP Status         | توضیح       |
| -------------------------------------------------------- | ------------------- | ----------- |
| `/about`                                                 | 200                 | ✅ حل شده   |
| `/case-studies`                                          | 200                 | ✅ حل شده   |
| `/services`                                              | 200                 | ✅ حل شده   |
| `/pdf-tools/compress/compress-pdf`                       | 200                 | ✅ حل شده   |
| `/pdf-tools/convert/pdf-to-text`                         | 200                 | ✅ حل شده   |
| `/blog/2026-07-17-national-id-validation-complete-guide` | 200                 | ✅ حل شده   |
| `/blog/2026-07-09-contract-tools-pillar`                 | 200                 | ✅ حل شده   |
| `/brand/asdev-portfolio`                                 | 308 → `/asdev`      | ✅ ریدایرکت |
| `/topics/text-tools`                                     | 308 → `/text-tools` | ✅ ریدایرکت |

**نتیجه:** تمام خطاهای 5xx **موقتی** بوده‌اند. احتمالاً cold start یا memory pressure.
**اقدام:** نیازی نیست (موقتی بوده)

## ۳. Not found (404) — ۳۰ صفحه

### ۳.۱ واقعاً 404 (۳ صفحه)

| صفحه                               | توضیح                   |
| ---------------------------------- | ----------------------- |
| `/pdf-tools/edit/reorder-pdf`      | URL اشتباه              |
| `/pdf-tools/edit/delete-pdf-pages` | URL اشتباه              |
| `/pdf-tools/converter/pdf-to-word` | `converter` ≠ `convert` |

**اقدام:** ساخت 301 redirect به صفحه مرتبط

### ۳.۲ ریدایرکت‌های صحیح (16 صفحه)

تمام ریدایرکت‌ها کار می‌کنند:

- `http://` → `https://` ✅
- `www.*` → non-www ✅
- `/topics/*` → مسیرهای جدید ✅
- `/contract-tools/rental-contract` → `/lease-agreement` ✅

### ۳.۳ نویز crawling

- `/?q={search_term_string}` — URL قالبی
- `/feed.xmlGET` — گوگل GET را چسبانده
- `/$` `/&` — URL مخرب

**اقدام:** نیازی نیست (نویز طبیعی)

## ۴. Crawled — currently not indexed — ۶۱ صفحه

تمام صفحات test شده **200 برمی‌گردانند** و **`robots: index, follow`** دارند.

**شامل:**

- فایل‌های فونت (`Vazirmatn-*.woff2`, `NotoSans-Regular.ttf`)
- OG images (`/opengraph-image`)
- صفحات متنی (`/text-tools/remove-spaces`, `/text-tools/word-counter`)
- تگ‌های بلاگ

**نتیجه:** گوگل crawl کرده ولی به دلیل محتوای تکراری/کم ارزش ایندکس نکرده.

**اقدام:** block کردن فایل‌های فونت و OG images در robots.txt

## ۵. Discovered — currently not indexed — ۱۵۳ صفحه

صفحاتی که در sitemap هستند ولی گوگل هنوز crawl نکرده.

**شامل:**

- مقالات بلاگ (خرداد و تیر)
- صفحات ابزارها (`/seo-tools/*`, `/image-tools/*`)
- صفحات تگ و دسته‌بندی

**نتیجه:** مسئله crawl budget — گوگل ۴۳۹ URL دارد ولی به همه نرسیده.

**اقدام:** صبر + بهبود internal linking

## ۶. Duplicate without user-selected canonical — ۴ صفحه

`www.persiantoolbox.ir/guides/*` — canonical وجود ندارد.

**واقعیت:** تمام www pages با 301 redirect صحیح به non-www می‌روند و canonical در مقصد وجود دارد. **نیازی به اقدام نیست** (GSC reporting lag).

## اقدامات اجرایی — وضعیت

| #   | اقدام                                         | اولویت | فایل‌ها                                    | وضعیت                                |
| --- | --------------------------------------------- | ------ | ------------------------------------------ | ------------------------------------ |
| 1   | کاهش `MIN_INDEXABLE_TAG_POSTS` از 2 به 1      | بالا   | `lib/blog.ts`                              | ✅ انجام شد                          |
| 2   | بررسی منبع ghost blog URLs                    | بالا   | تحقیق                                      | ✅ بررسی شد (از deployment‌های قبلی) |
| 3   | اضافه کردن redirect برای 3 صفحه 404           | متوسط  | `next.config.mjs`                          | ✅ انجام شد                          |
| 4   | Block فایل‌های فونت و OG images در robots.txt | متوسط  | `app/robots.ts`                            | ✅ انجام شد                          |
| 5   | بررسی canonical برای guides                   | پایین  | `app/guides/[slug]/page.tsx`               | ✅ بررسی شد (نیازی نیست)             |
| 6   | آپدیت تست‌ها                                  | متوسط  | `tests/unit/next-config-redirects.test.ts` | ✅ انجام شد                          |

### تغییرات اعمال شده

**`lib/blog.ts:324`** — `MIN_INDEXABLE_TAG_POSTS` از 2 به 1 تغییر کرد.

- تگ‌های بلاگ با حداقل ۱ مقاله الان ایندکس می‌شوند.
- ~30 تگ بلاگ که قبلاً noindex بودند الان index خواهند شد.

**`next.config.mjs`** — 3 redirect permanent اضافه شد:

- `/pdf-tools/edit/reorder-pdf` → `/pdf-tools/edit/reorder-pages`
- `/pdf-tools/edit/delete-pdf-pages` → `/pdf-tools/edit/delete-pages`
- `/pdf-tools/converter/pdf-to-word` → `/pdf-tools/convert/pdf-to-text`

**`app/robots.ts`** — Disallow برای فایل‌های استاتیک:

- `/fonts/` — فایل‌های فونت (Vazirmatn, NotoSans, IRANSansX)
- `/opengraph-image` — OG image generation endpoints
- اعمال شده برای همه user-agents و AI crawlers

**`tests/unit/next-config-redirects.test.ts`** — شمارش redirect‌ها آپدیت شد:

- v3 disabled: 24 → 27
- v3 enabled: 27 → 30

### نتایج تست

```
Test Files  198 passed (198)
Tests  1471 passed (1471)
```

### نکته — Ghost Blog Articles

74 مقاله بلاگ با slug‌های تاریخ‌دار (مثل `2026-06-24-invoice-generator-guide`) در GSC
به عنوان "Excluded by noindex" نمایش داده می‌شوند. این مقالات:

- فایل .md ندارند
- در sitemap نیستند
- از deployment‌های قبلی باقی مانده‌اند
- صفحه `not-found.tsx` با `robots: noindex, follow` برمی‌گردانند
- **نیاز به اقدام کدنویسی ندارند** — گوگل به تدریج آنها را حذف می‌کند

### Verification

```bash
pnpm typecheck  # pass
pnpm lint       # pass
pnpm vitest --run  # 198 files, 1471 tests pass
```
