# برنامه فنی و اجرایی ارتقای Persian Toolbox برای ایجنت‌های CLI

> وضعیت سند: اجرایی، قابل واگذاری به ایجنت‌های CLI، مناسب برای تبدیل پروژه به یک محصول تجاری سطح‌بالا در بازار ایران  
> تاریخ تدوین: 2026-06-15  
> دامنه: UI/UX، SEO، ابزارها، تجاری‌سازی، کیفیت، امنیت، عملکرد، عملیات و رشد

## 1. هدف کلان

هدف این سند تبدیل Persian Toolbox از یک مجموعه ابزار کاربردی به یک پلتفرم تجاری، قابل اعتماد، سریع، سئو-محور و قابل توسعه برای کاربران فارسی‌زبان است. خروجی هر ایجنت باید کوچک، قابل تست، قابل بازبینی و هم‌راستا با معماری local-first پروژه باشد.

### نتیجه مطلوب در 90 روز

- تجربه کاربری یکپارچه و حرفه‌ای در همه صفحات ابزار، صفحات محتوایی، صفحات پولی و پنل‌ها.
- سئوی فنی و محتوایی کامل برای خوشه‌های ابزار، ابزارهای اصلی و راهنماها.
- افزایش تعداد ابزارهای ارزشمند با اولویت نیاز واقعی کاربران ایران.
- آماده‌سازی مسیر درآمدی شامل پلن‌ها، تبلیغات شفاف، API/Pro و همکاری تجاری.
- ایجاد گیت‌های کیفیت خودکار برای جلوگیری از برگشت مشکلات UI، SEO، a11y، performance و local-first.

## 2. اصول اجرای ایجنت‌ها

هر ایجنت CLI باید این قواعد را رعایت کند:

1. قبل از تغییر، `git status --short` را بررسی کند.
2. فقط یک حوزه مشخص را تغییر دهد؛ PRهای بزرگ و مخلوط ممنوع است.
3. برای هر تغییر UI، تست unit یا e2e مرتبط اضافه کند.
4. برای هر تغییر SEO، تست contract یا snapshot structured data اضافه کند.
5. برای هر ابزار جدید، منطق pure، تست unit، صفحه UI، محتوای SEO، tier و مسیر sitemap داشته باشد.
6. هیچ ابزار local-first نباید فایل یا داده کاربر را بدون رضایت روشن به سرور ارسال کند.
7. هر PR باید حداقل این چک‌ها را اجرا کند:
   - `pnpm lint`
   - `pnpm typecheck`
   - تست‌های مرتبط با فایل‌های تغییرکرده
   - `git diff --check`
8. برای تغییرات بزرگ‌تر از UI/SEO، `pnpm build` هم الزامی است.
9. اگر تغییر قابل مشاهده در وب‌اپ است، Playwright یا screenshot verification اضافه شود.
10. هر ایجنت باید در پایان، خلاصه تغییر، تست‌ها، ریسک‌های باقی‌مانده و فایل‌های لمس‌شده را گزارش کند.

## 3. نقشه مرحله‌ای اجرا

### Phase 0 — تثبیت خط پایه

هدف: جلوگیری از ساختن فیچر روی پایه نامطمئن.

#### تسک‌ها

- اجرای baseline کامل:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm vitest --run`
  - `pnpm build`
  - `pnpm quality:links:check`
  - `pnpm pwa:shell:check`
- ثبت خروجی‌ها در `docs/status.auto.json` یا سند handoff جدید.
- استخراج top failing یا flaky tests، اگر وجود داشت.
- بررسی ناسازگاری نسخه‌ها در `package.json` و lockfile.

#### معیار پذیرش

- baseline وضعیت سبز یا لیست دقیق خطاها با owner، اولویت و مسیر رفع داشته باشد.
- هیچ تغییر محصولی در این فاز انجام نشود مگر برای رفع خطای baseline.

#### Prompt پیشنهادی برای ایجنت CLI

```text
You are assigned Phase 0 baseline stabilization. Do not add product features. Run the baseline commands, identify failing or flaky checks, fix only deterministic project issues, and document remaining environment limitations. Keep changes minimal and commit with tests.
```

---

### Phase 1 — یکپارچه‌سازی UI و Design System

هدف: همه صفحات شبیه یک محصول واحد باشند، نه مجموعه‌ای از صفحات جدا.

#### مشکلات رایج قابل انتظار

- اختلاف spacing و card styles در صفحات ابزار.
- تفاوت فرم‌ها، inputها، empty stateها و error stateها.
- تفاوت CTAها، headings و hierarchy در صفحات مالی، PDF، متن و تصویر.
- نبود الگوی ثابت برای loading، success، error، copy-to-clipboard و validation.

#### تسک‌های اجرایی

1. ساخت یا تکمیل primitiveهای مشترک در `shared/ui` و `components/ui`:
   - `PageHeader`
   - `ToolPageShell`
   - `ToolInputPanel`
   - `ToolResultPanel`
   - `EmptyState`
   - `ErrorState`
   - `CopyButton`
   - `InlineHelp`
   - `TrustBadgeRow`
2. جایگزینی تدریجی UIهای تکراری در ابزارهای پرترافیک:
   - `/loan`
   - `/salary`
   - `/interest`
   - `/pdf-tools/merge/merge-pdf`
   - `/image-tools`
   - `/text-tools/address-fa-to-en`
3. استانداردسازی heading hierarchy:
   - فقط یک `h1` در هر صفحه.
   - sectionهای اصلی با `h2`.
   - card داخلی با `h3`.
4. استانداردسازی CTAها:
   - primary فقط برای اقدام اصلی صفحه.
   - secondary برای مسیرهای بعدی.
   - destructive فقط برای حذف/پاک‌سازی.
5. افزودن Storybook stories برای primitiveهای مهم.
6. افزودن تست‌های a11y با axe برای صفحات پرترافیک.

#### معیار پذیرش

- صفحات هدف از shell و primitiveهای مشترک استفاده کنند.
- همه فرم‌ها label قابل دسترس داشته باشند.
- همه actionها stateهای loading/error/success داشته باشند.
- تست‌های مربوطه پاس شوند.

#### Prompt پیشنهادی برای ایجنت CLI

```text
Unify UI for one selected high-traffic tool page using existing or new shared UI primitives. Do not refactor unrelated tools. Add/adjust tests for accessible labels, error state, and result rendering. Keep visual language consistent with globals.css tokens.
```

---

### Phase 2 — UX کامل و جریان‌های کاربری

هدف: کاربر بدون فکر اضافی ابزار را پیدا کند، بفهمد، استفاده کند، نتیجه بگیرد و به ابزار بعدی برود.

#### تسک‌های اجرایی

1. بهبود discovery:
   - جست‌وجوی ابزارها با ranking بهتر.
   - فیلتر دسته، local-first tier و محبوبیت.
   - نمایش ابزارهای مرتبط در انتهای هر صفحه ابزار.
2. بهبود onboarding هر ابزار:
   - نمونه ورودی آماده.
   - توضیح کوتاه «چه زمانی استفاده کنم؟».
   - هشدارهای حریم خصوصی و محدودیت ابزار.
3. بهبود retention:
   - recent tools.
   - favorite tools.
   - history local برای ابزارهای مالی و متنی.
4. بهبود mobile UX:
   - sticky action bar فقط در ابزارهای فرم‌محور.
   - کنترل scroll و focus بعد از نتیجه.
   - tap target حداقل 44px.
5. بهبود empty/error states:
   - پیام قابل اقدام.
   - پیشنهاد ابزار جایگزین.
   - لینک پشتیبانی برای خطای تکرارشونده.

#### معیار پذیرش

- کاربر در صفحه ابزار همیشه بداند: ابزار چه می‌کند، چه ورودی می‌خواهد، خروجی کجاست و قدم بعدی چیست.
- برای مسیرهای اصلی، تست Playwright وجود داشته باشد.

#### Prompt پیشنهادی برای ایجنت CLI

```text
Improve UX for one tool workflow end-to-end: discovery context, sample input, validation, result focus, related tools, and empty/error states. Add Playwright or Testing Library coverage for the improved flow.
```

---

### Phase 3 — SEO فنی و محتوایی کامل

هدف: ساخت یک موتور جذب ارگانیک پایدار برای بازار فارسی.

#### تسک‌های فنی SEO

1. قرارداد metadata برای همه صفحات:
   - title یکتا و کمتر از 60 کاراکتر پیشنهادی.
   - description یکتا و کمتر از 160 کاراکتر پیشنهادی.
   - canonical مطلق.
   - OG image مناسب هر خوشه.
2. JSON-LD استاندارد:
   - `SoftwareApplication` برای ابزارها.
   - `FAQPage` فقط وقتی FAQ در UI هم دیده می‌شود.
   - `BreadcrumbList` هماهنگ با breadcrumb UI.
   - `ItemList` برای دسته‌ها و topicها.
   - عدم استفاده از rating، review یا price غیرواقعی.
3. Sitemap پیشرفته:
   - dedupe مسیرها.
   - priority و changeFrequency بر اساس نوع صفحه.
   - lastModified از registry یا build date معتبر.
4. Robots و noindex:
   - noindex برای account، admin، checkout، dashboard، API.
   - عدم noindex برای صفحات ابزار و راهنما.
5. Internal linking:
   - هر ابزار باید به دسته، ابزارهای مرتبط و حداقل یک راهنمای مرتبط لینک دهد.
   - هر guide باید به ابزارهای مرتبط لینک دهد.
6. Content briefs برای ابزارهای مهم:
   - مسئله کاربر.
   - مراحل استفاده.
   - مثال واقعی ایرانی.
   - FAQ.
   - محدودیت/هشدار.

#### خوشه‌های محتوایی پیشنهادی

- خوشه PDF:
  - ادغام PDF
  - فشرده‌سازی PDF
  - تبدیل PDF به عکس
  - حذف صفحات PDF
  - رمزگذاری PDF
- خوشه مالی:
  - محاسبه قسط وام
  - محاسبه حقوق خالص
  - محاسبه سود بانکی
  - مقایسه وام و سپرده
  - بودجه ماهانه خانوار
- خوشه متن فارسی:
  - تبدیل عدد به حروف
  - اصلاح نیم‌فاصله
  - تبدیل آدرس فارسی به انگلیسی
  - شمارش کلمات فارسی
  - ساخت slug فارسی/انگلیسی
- خوشه تصویر:
  - فشرده‌سازی عکس
  - تغییر اندازه عکس
  - تبدیل فرمت تصویر
  - حذف metadata تصویر

#### معیار پذیرش

- تست contract برای metadata و JSON-LD وجود داشته باشد.
- link checker پاس شود.
- برای ابزارهای پرترافیک، Lighthouse SEO score هدف 100 باشد.

#### Prompt پیشنهادی برای ایجنت CLI

```text
Implement SEO completeness for one tool cluster. Ensure metadata, JSON-LD, visible FAQ, internal links, sitemap inclusion, and tests are aligned. Do not add unverifiable structured data. Run lint, typecheck, relevant SEO tests, and link checks.
```

---

### Phase 4 — تکمیل ابزارها و فیچرهای جدید

هدف: افزایش ارزش محصول با ابزارهای پرتقاضا و قابل درآمدزایی.

#### اولویت ابزارهای جدید

##### P0 — پرتقاضا و هم‌راستا با local-first

1. ویرایش متن فارسی:
   - اصلاح ی/ک عربی.
   - اصلاح فاصله و نیم‌فاصله.
   - حذف کاراکترهای نامرئی.
   - شمارش کلمات، جمله‌ها و زمان مطالعه.
2. ابزارهای PDF تکمیلی:
   - استخراج تصاویر از PDF.
   - تبدیل چند عکس به PDF با تنظیم اندازه صفحه.
   - افزودن امضا/مهر تصویری به PDF.
3. ابزارهای تصویر:
   - تغییر اندازه batch.
   - تبدیل PNG/JPG/WebP.
   - حذف EXIF و metadata.
4. ابزارهای مالی ایران:
   - محاسبه مالیات حقوق به‌روز با نسخه داده.
   - مقایسه سناریوهای وام.
   - محاسبه بودجه ماهانه.

##### P1 — تجاری و رشدپذیر

1. ابزارهای کسب‌وکار:
   - ساخت فاکتور ساده.
   - محاسبه ارزش افزوده.
   - تبدیل CSV به Excel/JSON.
2. ابزارهای توسعه‌دهنده:
   - JSON formatter.
   - Base64 encode/decode.
   - JWT decoder local-only.
   - Regex tester فارسی.
3. ابزارهای محتوا:
   - تولید slug.
   - پاک‌سازی متن کپی‌شده از Word/PDF.
   - شمارش density کلمات کلیدی.

##### P2 — فیچرهای premium

1. ذخیره history ابری اختیاری.
2. batch processing بزرگ‌تر.
3. templateهای خروجی PDF.
4. API محدود برای ابزارهای متنی و مالی.
5. فضای کاری تیمی برای کسب‌وکارها.

#### قرارداد افزودن هر ابزار جدید

هر ابزار باید این فایل‌ها/بخش‌ها را داشته باشد:

- logic pure در `features/<tool>/` یا `shared/utils/`.
- تست unit برای edge cases.
- صفحه Next.js در `app/(tools)/...`.
- کامپوننت UI در `components/features/...`.
- ثبت در `lib/tools-registry.ts` با title، description، keywords، tier، content و lastModified.
- محتوای SEO قابل نمایش.
- تست indexing/sitemap در صورت indexable بودن.
- اگر فایل پردازش می‌کند: تضمین local-first و پیام حریم خصوصی.

#### Prompt پیشنهادی برای ایجنت CLI

```text
Add one new local-first tool following the project tool contract. Implement pure logic, UI, registry entry, SEO content, tests, and sitemap/indexing coverage. Include privacy copy and do not send user data to the server.
```

---

### Phase 5 — تجاری‌سازی و تبدیل به سایت برتر ایران

هدف: درآمدزایی بدون تخریب اعتماد کاربر.

#### مسیرهای درآمدی پیشنهادی

1. Freemium:
   - ابزارهای پایه رایگان.
   - batch بزرگ‌تر، history ابری، templateها و exportهای پیشرفته در Pro.
2. تبلیغات شفاف:
   - فقط جایگاه‌های مشخص.
   - بدون تبلیغات مزاحم در ابزارهای حساس.
   - صفحه شفافیت تبلیغات.
3. API و B2B:
   - API ابزارهای متنی و مالی.
   - پلن توسعه‌دهنده.
   - rate limit و billing روشن.
4. Sponsorship ابزارها:
   - اسپانسر دسته ابزار، نه دستکاری خروجی ابزار.
5. خدمات سازمانی:
   - نصب on-premise یا white-label برای شرکت‌ها.

#### فیچرهای تجاری لازم

- صفحه pricing روشن.
- صفحه comparison رایگان/Pro.
- checkout قابل اعتماد.
- حساب کاربری با session امن.
- داشبورد مصرف.
- export invoice برای پرداخت‌ها.
- سیستم feature flags برای rollout.
- analytics privacy-preserving.

#### معیار پذیرش

- monetization هیچ ابزار local-first را به ابزار وابسته به سرور تبدیل نکند، مگر با رضایت و برچسب واضح.
- مسیر پرداخت و حساب کاربری تست e2e داشته باشد.
- همه صفحات پولی noindex/robots صحیح داشته باشند، مگر صفحات marketing.

#### Prompt پیشنهادی برای ایجنت CLI

```text
Implement one monetization improvement without changing local-first guarantees. Add clear UX copy, feature flag guard, tests for enabled/disabled states, and noindex protection for private account/payment surfaces.
```

---

### Phase 6 — کیفیت، امنیت و اعتماد

هدف: اعتماد کاربر ایرانی به ابزارهای حساس مثل PDF و مالی.

#### تسک‌های امنیتی

- اجرای دوره‌ای `pnpm security:secrets` و `pnpm security:scan`.
- بررسی CSP و حذف inline/script غیرضروری.
- تست عدم ارسال فایل‌ها در ابزارهای local-first.
- rate limit برای APIها.
- CSRF برای مسیرهای state-changing.
- session hardening و secure cookies در production.

#### تسک‌های اعتماد محصول

- نمایش badge local-first در ابزارهای فایل‌محور.
- توضیح «فایل شما از مرورگر خارج نمی‌شود» در UI.
- صفحه trust/security.
- changelog قابل فهم برای کاربران.
- گزارش نسخه داده برای ابزارهای مالی و قوانین حقوق.

#### معیار پذیرش

- هر ابزار فایل‌محور test یا audit واضح برای عدم upload داشته باشد.
- security scan بدون high severity unresolved باشد.

#### Prompt پیشنهادی برای ایجنت CLI

```text
Audit one local-first file tool for privacy and security. Prove that files are not uploaded, improve user-facing trust copy, and add tests or guards that would fail if network upload is introduced.
```

---

### Phase 7 — عملکرد، PWA و تجربه ایران

هدف: سایت روی موبایل، اینترنت ناپایدار و دستگاه‌های متوسط سریع باشد.

#### تسک‌های عملکرد

- تعریف performance budget برای صفحات پرترافیک.
- کاهش JS صفحات ابزار با lazy loading.
- جداسازی dependencyهای سنگین PDF/image.
- کاهش re-render فرم‌های بزرگ.
- بهینه‌سازی font loading.
- Lighthouse CI روی مسیرهای کلیدی.

#### مسیرهای کلیدی Lighthouse

- `/`
- `/tools`
- `/loan`
- `/salary`
- `/pdf-tools`
- `/pdf-tools/merge/merge-pdf`
- `/image-tools`
- `/text-tools/address-fa-to-en`
- `/search`

#### PWA

- precache فقط برای shell ضروری.
- runtime caching برای assetها.
- offline page قابل اقدام.
- پیام update واضح.

#### معیار پذیرش

- LCP صفحات اصلی در شرایط throttled قابل قبول باشد.
- bundle ابزارهای PDF به صفحات غیرPDF نشت نکند.
- PWA shell check پاس شود.

#### Prompt پیشنهادی برای ایجنت CLI

```text
Optimize one high-traffic route for performance. Measure before/after, reduce unnecessary client JS or heavy imports, and add/adjust performance budget documentation or checks.
```

---

## 4. بک‌لاگ اجرایی پیشنهادی برای ایجنت‌ها

### Sprint 1 — UI/UX Foundation

| اولویت | تسک                             | فایل‌های محتمل                            | معیار پذیرش                       |
| ------ | ------------------------------- | ----------------------------------------- | --------------------------------- |
| P0     | ساخت `ToolPageShell` مشترک      | `components/ui`, `shared/ui`              | حداقل دو ابزار از آن استفاده کنند |
| P0     | استانداردسازی error/empty state | `shared/ui`                               | تست rendering و a11y              |
| P0     | UX نمونه ورودی برای loan/salary | `components/features/finance`             | تست تعامل کاربر                   |
| P1     | related tools در صفحات ابزار    | `components/seo`, `lib/tools-registry.ts` | لینک داخلی معتبر                  |

### Sprint 2 — SEO & Content Engine

| اولویت | تسک                             | فایل‌های محتمل                     | معیار پذیرش                |
| ------ | ------------------------------- | ---------------------------------- | -------------------------- |
| P0     | تست کامل metadata صفحات ابزار   | `tests/unit`                       | contract برای canonical/OG |
| P0     | JSON-LD breadcrumb هماهنگ با UI | `lib/seo-tools.ts`                 | تست نام و مسیر             |
| P1     | راهنمای خوشه PDF                | `app/guides`, `lib/guide-pages.ts` | لینک به ابزارها            |
| P1     | audit cannibalization titleها   | `lib/tools-registry.ts`            | title یکتا                 |

### Sprint 3 — Tools Expansion

| اولویت | ابزار               | دلیل                | معیار پذیرش              |
| ------ | ------------------- | ------------------- | ------------------------ |
| P0     | نرمال‌ساز متن فارسی | تقاضای عمومی و ساده | logic + UI + SEO + tests |
| P0     | حذف metadata تصویر  | اعتماد و privacy    | local-only + tests       |
| P1     | ساخت فاکتور ساده    | تجاری‌سازی          | template + PDF export    |
| P1     | JSON formatter      | جذب توسعه‌دهنده     | local-only + copy UX     |

### Sprint 4 — Monetization & Trust

| اولویت | تسک                         | معیار پذیرش                   |
| ------ | --------------------------- | ----------------------------- |
| P0     | صفحه comparison رایگان/Pro  | copy شفاف و بدون dark pattern |
| P0     | trust/security page         | توضیح local-first و privacy   |
| P1     | sponsorship slots کنترل‌شده | بدون اثر روی خروجی ابزار      |
| P1     | API docs برای ابزارهای متنی | rate limit و auth روشن        |

## 5. Definition of Done مشترک

هر PR زمانی کامل است که:

- lint/typecheck پاس شود.
- تست مرتبط اضافه یا به‌روزرسانی شود.
- تغییرات SEO با contract test پوشش داشته باشد.
- تغییرات UI با a11y پایه پوشش داشته باشد.
- مسیرهای جدید در sitemap/robots/registry درست باشند.
- متن فارسی طبیعی، کوتاه و بدون ترجمه ماشینی باشد.
- privacy و local-first نقض نشده باشد.
- PR شامل summary، testing و ریسک باقی‌مانده باشد.

## 6. چک‌لیست QA دستی برای صفحات ابزار

- آیا صفحه در موبایل بدون horizontal scroll است؟
- آیا با Tab می‌توان همه کنترل‌ها را پیمایش کرد؟
- آیا یک `h1` واضح وجود دارد؟
- آیا ورودی‌ها label دارند؟
- آیا خطای ورودی دقیق و قابل اقدام است؟
- آیا نتیجه بعد از اجرا قابل کپی/دانلود است؟
- آیا ابزار مرتبط یا قدم بعدی وجود دارد؟
- آیا canonical و title درست‌اند؟
- آیا structured data با UI visible هم‌خوان است؟
- آیا فایل/داده کاربر به سرور ارسال نمی‌شود؟

## 7. شاخص‌های موفقیت محصول

### فنی

- build پایدار.
- کاهش خطاهای e2e.
- Lighthouse performance و SEO بهتر در صفحات اصلی.
- کاهش bundle routeهای پرترافیک.

### تجربه کاربر

- کاهش زمان رسیدن به ابزار.
- افزایش completion rate ابزارها.
- افزایش استفاده از ابزارهای مرتبط.
- کاهش خطاهای validation تکراری.

### رشد و تجاری‌سازی

- افزایش impression و click از جست‌وجوی ارگانیک.
- افزایش signup اختیاری برای Pro.
- افزایش conversion صفحه pricing.
- افزایش استفاده از API یا ابزارهای B2B.

## 8. ترتیب پیشنهادی اجرای خودکار

1. Phase 0 baseline.
2. ساخت UI primitives مشترک.
3. مهاجرت loan و salary به الگوی UI جدید.
4. تکمیل SEO contracts برای ابزارهای مالی.
5. مهاجرت PDF merge/compress به الگوی UI جدید.
6. افزودن related tools و guide links.
7. افزودن نرمال‌ساز متن فارسی.
8. افزودن حذف metadata تصویر.
9. افزودن trust/security page.
10. اجرای Lighthouse CI و performance budget.
11. تکمیل comparison رایگان/Pro.
12. آماده‌سازی API docs و developer funnel.

## 9. الگوی گزارش خروجی ایجنت

```markdown
## Summary

- ...

## Files Changed

- `path/to/file`

## Tests

- ✅ `pnpm lint`
- ✅ `pnpm typecheck`
- ✅ `pnpm vitest --run ...`

## Product Impact

- UI/UX:
- SEO:
- Performance:
- Monetization:

## Risks / Follow-ups

- ...
```

## 10. ممنوعیت‌ها

- افزودن structured data غیرواقعی مثل rating/review ساختگی.
- ارسال فایل کاربر به سرور در ابزارهای local-first.
- افزودن dependency سنگین بدون تحلیل bundle.
- تغییر هم‌زمان UI، backend، billing و SEO در یک PR.
- حذف تست برای سبز کردن CI.
- استفاده از متن تبلیغاتی اغراق‌آمیز یا غیرقابل اثبات.

## 11. جمع‌بندی اجرایی

مسیر برنده برای Persian Toolbox تمرکز روی اعتماد، سرعت، فارسی‌بودن واقعی، ابزارهای کاربردی ایران، محتوای SEO خوشه‌ای و درآمدزایی بدون آسیب به privacy است. هر ایجنت باید کوچک، قابل اندازه‌گیری و قابل برگشت کار کند. اگر این سند به‌صورت sprintهای کوچک اجرا شود، پروژه می‌تواند از یک ابزارخانه خوب به یک پلتفرم برتر و تجاری در بازار ایران تبدیل شود.
