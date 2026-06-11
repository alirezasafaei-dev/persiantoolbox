# ممیزی عمیق پروژه PersianToolbox - 2026-06-11

این سند خروجی ممیزی محلی پروژه در تاریخ 2026-06-11 است. تمرکز ممیزی روی سلامت CI، امنیت، آمادگی انتشار، هم‌راستایی پیکربندی production، کیفیت تست‌ها، معماری قابلیت‌ها و شکاف‌های محصولی بود.

## خلاصه اجرایی

وضعیت کلی پروژه از نظر ساختار، تست واحد، قراردادهای release و headerهای امنیتی پایه نسبتاً بالغ است؛ اما پروژه برای انتشار بدون ریسک هنوز آماده نیست. `pnpm build` و `pnpm typecheck` پاس می‌شوند، ولی gateهای مهم CI شامل lint، تست واحد، contract checks، docs sync، performance budget، format check و E2E در وضعیت fail/warning هستند. مهم‌ترین ریسک‌ها عبارت‌اند از: عدم هم‌خوانی feature flagها با قرارداد disabled API، خطای lint سراسری به دلیل پیکربندی ESLint/plug-in، لینک داخلی شکسته، پیکربندی production env ناسازگار با کد، بودجه bundle شکسته، و CSRF/auth hardening ناکامل.

## فرمان‌های ممیزی اجراشده

- `pnpm lint` — fail: 105 خطای ESLint، عمدتاً rule تعریف‌نشده `react-refresh/only-export-components` و یک خطای indent.
- `pnpm typecheck` — pass.
- `pnpm vitest --run` — fail: 4 تست واحد مربوط به disabled API/admin site settings.
- `pnpm security:secrets` — pass: الگوی secret پرریسک در فایل‌های tracked پیدا نشد.
- `pnpm security:scan` — pass: آسیب‌پذیری high در dependencyهای production گزارش نشد.
- `pnpm ci:contracts` — fail: لینک داخلی شکسته `/docs/api`.
- `pnpm format:check` — fail: `next.config.mjs` با Prettier هم‌خوان نیست.
- `pnpm build` — pass.
- `pnpm docs:auto:check` — fail: مسیر `tasks-next` وجود ندارد.
- `pnpm performance:budgets` — fail: اندازه chunkها 3451KB و بیشتر از budget 3400KB است.
- `pnpm gate:local-first` — pass.
- `pnpm test:e2e:ci` — warning/fail محیطی: مرورگر Chromium Playwright نصب نبود؛ 11 تست پاس، 6 skipped و بقیه به‌دلیل executable missing اجرا نشدند.

## یافته‌های بحرانی و اولویت بالا

### 1. CI در وضعیت قرمز است و merge/release نباید انجام شود

`ci-core` در job کیفیت `pnpm ci:quick` و `pnpm docs:auto:check` را اجرا می‌کند، job قراردادها `pnpm ci:contracts` را اجرا می‌کند و job build نیز `pnpm build` و `pnpm performance:budgets` را اجرا می‌کند. با نتایج فعلی، چند job اصلی CI شکست می‌خورند و branch قابل اتکا برای release نیست.

اقدام پیشنهادی:

1. lint config و indent را اصلاح کنید.
2. قرارداد disabled API را با feature flag defaults هم‌راستا کنید.
3. مسیر شکسته `/docs/api` یا صفحه مربوط را ایجاد/اصلاح کنید.
4. `tasks-next` را بازگردانید یا docs sync را نسبت به نبود آن مقاوم کنید.
5. bundle budget را یا کاهش دهید یا budget policy را با داده واقعی و دلیل مستند به‌روزرسانی کنید.

### 2. پیکربندی ESLint با dependency/rule runtime ناسازگار است

در `.eslintrc.cjs` افزونه `react-refresh` و rule `react-refresh/only-export-components` فعال شده‌اند، اما `pnpm lint` برای بسیاری از فایل‌ها اعلام می‌کند rule پیدا نمی‌شود. این یعنی lint به‌جای گزارش کیفیت واقعی، در مرحله load rule شکست می‌خورد. علاوه بر آن، `lib/server/monetizationStorage.ts` خطای indent دارد.

اقدام پیشنهادی:

- نسخه و سازگاری `eslint-plugin-react-refresh` را با ESLint فعلی بررسی کنید.
- rule را فقط در فایل‌های Vite/React مناسب نگه دارید یا موقتاً از config حذف کنید.
- خطای indent در `lib/server/monetizationStorage.ts` را با Prettier/ESLint fix حل کنید.

### 3. قرارداد disabled API با default feature flags ناسازگار است

تست‌های `disabled-api-contract` انتظار status `410` و payload disabled دارند، اما `auth` و `admin-site-settings` به‌صورت پیش‌فرض enabled هستند. در نبود env/database، login به validation یا database path می‌رسد و admin route قبل از disabled response به admin auth می‌رسد. این باعث fail شدن تست‌ها و رفتار نامطمئن API در deployment بدون dependency کامل می‌شود.

اقدام پیشنهادی:

- تصمیم محصولی را روشن کنید: آیا `auth` و admin در v3 باید واقعاً enabled-by-default باشند یا gated-by-dependency؟
- اگر dependencyهای لازم مثل `DATABASE_URL`/`ADMIN_EMAIL_ALLOWLIST` نیستند، feature را در runtime disabled یا degraded کنید.
- تست‌ها را فقط پس از تصمیم محصولی اصلاح کنید؛ فعلاً تست‌ها نشان‌دهنده شکاف واقعی بین قرارداد و پیاده‌سازی هستند.

### 4. مسیر داخلی `/docs/api` شکسته است

لینک «مستندات API» در صفحه توسعه‌دهندگان به `/docs/api` اشاره دارد، اما app route متناظر وجود ندارد و `quality:links:check` همین را به‌عنوان broken same-origin link گزارش می‌کند.

اقدام پیشنهادی:

- یا route مستندات API را بسازید، یا لینک را به مسیر موجود مثل `/developers`، `/guides` یا مستندات external معتبر تبدیل کنید.
- برای جلوگیری از بازگشت مشکل، contract check لینک‌ها را در CI نگه دارید.

### 5. `.env.production` tracked و با runtime واقعی ناسازگار است

فایل `.env.production` در git track شده و Next build هم آن را load می‌کند. با اینکه secret واقعی در آن دیده نشد، این الگو خطر عملیاتی دارد. همچنین چند env کلیدی با کد هم‌خوان نیستند: production env از `DATABASE_PATH` و `SESSION_TTL_SECONDS` استفاده می‌کند، اما کد database فقط `DATABASE_URL` و session فقط `SESSION_TTL_DAYS` را می‌خواند. علاوه بر این، admin featureها در production env فعال‌اند، اما `ADMIN_EMAIL_ALLOWLIST` مقداردهی نشده است.

اقدام پیشنهادی:

- `.env.production` را به `.env.production.example` تبدیل کنید و فایل واقعی را از git حذف کنید.
- نام envها را با کد یکسان کنید یا کد را برای aliasهای مستند آماده کنید.
- production readiness gate اضافه کنید که اگر admin/auth/history enabled هستند، dependencyهای لازم وجود داشته باشند.

### 6. Auth flow برای production سخت‌سازی کافی ندارد

login endpoint اگر کاربر وجود نداشته باشد، در مسیر login کاربر جدید ایجاد می‌کند و comment خود کد هم اشاره می‌کند این فقط برای تست/MVP است. همچنین بدنه login فیلد `isAdmin` را می‌پذیرد. هرچند admin authorization فعلاً بر اساس allowlist ایمیل است، پذیرش چنین فیلدی در API عمومی و auto-create در login الگوی خطرناک برای production است.

اقدام پیشنهادی:

- auto-create را از login حذف و فقط در register/onboarding کنترل‌شده نگه دارید.
- فیلد `isAdmin` را از public login schema حذف کنید.
- نرخ‌گذاری، lockout، audit log و email verification را برای auth production اضافه کنید.

### 7. CSRF guard وجود دارد ولی در routeهای mutating استفاده نشده است

`lib/server/csrf.ts` تابع same-origin دارد، اما جست‌وجوی کد نشان داد routeهای API از آن استفاده نمی‌کنند. خود guard نیز نبود Origin/Referer را مجاز می‌داند؛ این رفتار برای non-browser clientها مفید است، اما برای cookie-based browser session روی routeهای حساس باید سخت‌گیرانه‌تر شود.

اقدام پیشنهادی:

- روی routeهای cookie-authenticated و mutating مثل admin settings، auth logout، site settings update و monetization update CSRF protection اعمال کنید.
- برای browser session از token یا حداقل same-origin strict همراه با allowlist explicit برای API clients استفاده کنید.

## یافته‌های متوسط

### 8. بودجه performance شکسته است

`pnpm performance:budgets` گزارش می‌دهد total chunks برابر 3451KB است، در حالی که budget فعلی 3400KB است. فاصله کم است، ولی fail شدن build job release را متوقف می‌کند.

اقدام پیشنهادی:

- bundle analyzer را روی مسیرهای PDF/image/framer-motion اجرا کنید.
- dynamic import و code splitting برای ابزارهای سنگین PDF/image را بازبینی کنید.
- اگر افزایش عمدی بوده، budget policy را همراه با rationale و سقف جدید به‌روزرسانی کنید.

### 9. docs automation به دایرکتوری حذف‌شده/مفقود وابسته است

`docs:auto:check` با خطای `ENOENT` روی `tasks-next` شکست می‌خورد. چون این command در CI quality job اجرا می‌شود، کیفیت branch را مسدود می‌کند.

اقدام پیشنهادی:

- یا `tasks-next` را احیا کنید، یا `scripts/docs/sync-docs.mjs` را طوری تغییر دهید که نبود optional source را با پیام actionable مدیریت کند.

### 10. E2E local reproducibility ناقص است

`test:e2e:ci` در این محیط به‌دلیل نبود browser executable قابل اتکا نبود. CI نصب browser دارد، اما برای توسعه محلی باید bootstrap/doctor command واضح باشد.

اقدام پیشنهادی:

- `pnpm exec playwright install --with-deps chromium` را در docs توسعه و codex bootstrap برجسته کنید.
- یک `pnpm e2e:doctor` یا check سبک اضافه کنید که قبل از اجرای suite، browser نصب‌شده را بررسی کند.

### 11. امنیت headers پایه خوب است، اما CSP ممکن است عملیاتی شکننده باشد

proxy headerهای امنیتی، CSP nonce، COOP/CORP، frame deny و HSTS مشروط را تنظیم می‌کند. این نقطه قوت است. اما CSP شامل `style-src 'self'` است و اگر inline style/runtime style در production لازم شود، ممکن است breakage ایجاد کند؛ نیاز به E2E واقعی با مرورگر نصب‌شده دارد.

اقدام پیشنهادی:

- E2E security headers را روی build production و مرورگر واقعی اجرا کنید.
- report-only CSP staging برای تغییرات UI سنگین اضافه کنید.

## نقاط قوت مشاهده‌شده

- TypeScript check پاس شد.
- Production build با Next 16 پاس شد.
- secret scan و production dependency audit آسیب‌پذیری high گزارش نکردند.
- CodeQL و Dependabot برای GitHub Actions/npm پیکربندی شده‌اند.
- headerهای امنیتی پایه و request-id propagation وجود دارد.
- معماری feature flag و disabled API payload پایه دارد و قابل تکمیل است.
- suite تست واحد گسترده است و 304 تست از 308 تست فعلی پاس شدند.

## نقشه راه پیشنهادی برای تکمیل پروژه

### فاز 0: بازگرداندن CI به سبز

1. ESLint config/plugin را اصلاح کنید.
2. Prettier را روی `next.config.mjs` اعمال کنید.
3. قرارداد disabled API و defaults را هم‌راستا کنید.
4. لینک `/docs/api` را اصلاح کنید.
5. `tasks-next`/docs sync را اصلاح کنید.
6. بودجه performance را با کاهش bundle یا policy جدید حل کنید.

### فاز 1: hardening امنیتی پیش از production

1. `.env.production` را از tracked secrets/config واقعی جدا کنید.
2. auth login را از auto-register جدا کنید و `isAdmin` را حذف کنید.
3. CSRF protection را به routeهای cookie-authenticated اضافه کنید.
4. dependency-aware feature gating برای auth/admin/history پیاده کنید.
5. readiness gate برای envهای production اضافه کنید.

### فاز 2: کیفیت محصول و عملیات

1. E2E را در محیط محلی و CI reproducible کنید.
2. صفحات/مستندات API developer را تکمیل کنید.
3. observability production را با health/ready، error tracking و dashboards واقعی تقویت کنید.
4. budgetهای performance را per-route کنید، مخصوصاً برای PDF/image tools.
5. مستندات deployment را با env contract واقعی sync کنید.

## جمع‌بندی تصمیم انتشار

تا زمانی که lint، unit tests، contract checks، docs sync و performance budget fail هستند، انتشار production یا merge به شاخه اصلی توصیه نمی‌شود. اولویت اول باید سبز کردن CI و هم‌راستا کردن feature flagها با dependencyهای production باشد؛ سپس hardening امنیتی auth/CSRF/env انجام شود.
