# Codex Growth Loop State

این فایل append-only است. اعداد فقط با منبع و بازهٔ صریح ثبت می‌شوند.

## Cycle GL-20260808-01 — baseline ابزار تبدیل آدرس

- آخرین production SHA مشاهده‌شده: `01f64af154bc15d1b449b5ba9eb5a84b0b324f60`
- بازه داده:
  - GSC 7d نهایی: `2026-07-31..2026-08-06`
  - GSC 28d نهایی: `2026-07-10..2026-08-06`
  - product funnel: غیرقابل استخراج؛ event/dimension/range ناقص است.
- baseline metrics:
  - کل Domain Property، 7d: 202 click، 2,128 impression، CTR 9.49%، position 12.17
  - کل Domain Property، 28d: 604 click، 5,449 impression، CTR 11.08%، position 11.93
  - `/text-tools/address-fa-to-en`، 7d: 111 click، 257 impression، CTR 43.19%، position 2.53
  - `/text-tools/address-fa-to-en`، 28d: 365 click، 914 impression، CTR 39.93%، position 3.20
  - 28d device: desktop 363/2,838، mobile 237/2,577، tablet 4/34 (click/impression)
  - 28d Iran: 582 click، 4,428 impression، CTR 13.14%، position 9.69
  - `tool_start`، `tool_complete` تفکیک‌شده برای ابزار، export/signup/payment و error rate: baseline معتبر موجود نیست؛ نبود داده صفر conversion نیست.
- active hypothesis: اگر lifecycle ابزار تبدیل آدرس با `tool_start` و اولین `tool_complete` و dimension امن `tool_id` به‌صورت روزانه ثبت شود، پس از release می‌توان bottleneck واقعی landing→start→complete را بدون جمع‌آوری متن آدرس تعیین کرد.
- تغییر انجام‌شده: در انتظار TDD implementation.
- branch/commit: `growth/loop-20260808-funnel-baseline` / در انتظار commit.
- verification evidence: GSC readonly probe سبز؛ جزئیات implementation در ادامهٔ همین cycle append می‌شود.
- release status: `NOT_RELEASED`؛ release هدیهٔ ثبت‌نام در `main` نیز هنوز روی production نیست و این چرخه deploy نمی‌کند.
- earliest evaluation date: تعیین‌نشده؛ هفت روز کامل پس از release این instrumentation (`T_release + 7d`).
- نتیجه آزمایش‌های قبلی: آزمایش قابل‌قیاس قبلی در state وجود ندارد.
- rejected hypotheses:
  - «CTR صفحه آدرس bottleneck اصلی است»: رد شد؛ CTR صفحه در 7d برابر 43.19% و تقاضا/رتبه قوی است.
  - «completion پایین است»: فعلاً نه رد و نه تأیید؛ event قابل تفکیک وجود ندارد.
  - «نبود event یعنی conversion صفر است»: رد شد؛ coverage ناقص و API range را پشتیبانی نمی‌کند.
- blockerهای واقعی:
  - self-hosted store، `tool_id` و `category` را حذف می‌کند.
  - event دقیق `tool_start` تعریف/emit نشده است.
  - admin analytics برای `range=7d|28d` مقدار aggregate بازمی‌گرداند و `rangeSupported=false` است.
  - Search Console Domain Property شامل subdomain `llm.persiantoolbox.ir` نیز هست؛ totals دامنه با funnel محصول یکی نیست.
- next candidate: بعد از baseline، تصمیم فقط از میان بهبود start rate یا completion rate همین ابزار؛ تا آن زمان CTA/SEO جدید انتخاب نشود.

### Experiment card

- `cycle_id`: `GL-20260808-01`
- `problem`: تقاضای ارگانیک صفحهٔ آدرس اثبات شده، اما landing→tool_start→tool_complete قابل اندازه‌گیری نیست.
- `evidence`: GSC تازهٔ 7d/28d بالا؛ audit کد نشان داد `tool_start` غایب، metadata ابزار حذف و range پشتیبانی نمی‌شود.
- `hypothesis`: ثبت امن و once-per-mount اولین ورود داده و اولین completion، baseline قابل اعتماد برای تصمیم چرخهٔ بعد می‌سازد.
- `target_page_or_tool`: `/text-tools/address-fa-to-en`
- `primary_metric`: `tool_complete / tool_start` برای `tool_id=address-fa-to-en`
- `baseline`: ناموجود/غیرقابل اعتماد؛ این چرخه baseline می‌سازد.
- `success_threshold`: تعریف نمی‌شود؛ هدف measurement validity است، نه ادعای uplift.
- `guardrails`: anonymous access بدون تغییر؛ صفر متن/نام/آدرس/کدپستی در analytics؛ error rate و performance بدون regression؛ event تکراری در یک mount ثبت نشود.
- `events`: `tool_start`, `tool_complete` با `tool_id`, `category`؛ aggregate روزانه فقط.
- `utm_contract`: attribution جدیدی ایجاد نمی‌شود؛ path فعلی query/hash را حذف می‌کند و UTM موجود توسط صفحه/Plausible حفظ می‌شود.
- `implementation_scope`: یک ابزار + allowlist/counter/range report مشترک؛ بدون UI، pricing، auth، credit یا payment change.
- `evaluation_window`: 7 روز کامل پس از release؛ snapshot 28d فقط برای روند بلندتر.
- `continue_rule`: پس از حداقل 7 روز داده و حداقل 30 `tool_start`، bottleneck بزرگ‌تر انتخاب شود.
- `stop_rule`: اگر کمتر از 30 start یا ingestion ناقص باشد، نتیجه `inconclusive` و instrumentation بررسی شود.
- `rollback_rule`: revert یک commit اگر duplicate event، PII leakage، خطای ingestion یا regression عملکرد دیده شود.

### Candidate scoring (1=ضعیف، 5=قوی؛ risk هرچه بیشتر بدتر)

| کاندید                  | evidence | impact | reach | effort | reversibility | clarity | privacy risk | time to signal | تصمیم                                   |
| ----------------------- | -------: | -----: | ----: | -----: | ------------: | ------: | -----------: | -------------: | --------------------------------------- |
| baseline lifecycle آدرس |        5 |      4 |     5 |      3 |             5 |       5 |            1 |              4 | انتخاب                                  |
| بازنویسی meta OCR       |        3 |      3 |     3 |      5 |             5 |       4 |            1 |              2 | رد؛ instrumentation محصول را حل نمی‌کند |
| CTA فروش روی PDF        |        2 |      4 |     2 |      2 |             4 |       2 |            2 |              3 | رد؛ baseline و release قبلی آماده نیست  |

### Completion evidence — 2026-08-08

- تغییر انجام‌شده:
  - `tool_start` پس از اولین ورودی واقعی و فقط یک‌بار در هر mount ثبت می‌شود.
  - اولین خروجی کامل فقط یک `tool_complete` ثبت می‌کند.
  - metadata محدود به `tool_id=address-fa-to-en` و `category=text-tools` است؛ متن آدرس، نام، کدپستی و query ذخیره نمی‌شود.
  - تعریف `tool_start` در این چرخه «اولین ورود داده» است؛ تغییر mode یا بازکردن fast-input بدون واردکردن داده start محسوب نمی‌شود.
  - aggregate روزانهٔ `tool_event` و گزارش funnel برای بازه‌های 7/28/30 روزه اضافه شد؛ سایر aggregateهای پاسخ همچنان all-time هستند و `rangeScope=toolFunnel` این مرز را صریح می‌کند.
  - proxy داخلی فقط برای `/api/analytics` secret ingest را به request داخلی اضافه می‌کند؛ secret در response یا bundle مرورگر قرار نمی‌گیرد.
- verification evidence:
  - RED: 3 فایل/3 تست شکست خوردند؛ event شروع، counter ابزار و range funnel موجود نبود.
  - GREEN هدفمند: 3 فایل/3 تست؛ مجاور: 7 فایل/16 تست؛ همگی سبز.
  - full Vitest پس از review fix: 207 فایل/1,671 تست، صفر failure.
  - `pnpm typecheck`، `pnpm lint`، `pnpm gate:local-first` و `pnpm licensing:validate`: exit 0.
  - production build: Next.js standalone، 960 صفحه، exit 0؛ `.next/standalone/server.js` موجود.
  - local standalone smoke: 11 check روی پورت آزاد 3188، exit 0. پورت پیش‌فرض 3100 از قبل توسط `next-server` اشغال بود و اجرای اول با `EADDRINUSE` متوقف شد.
  - production-mode ingest smoke روی standalone: POST بدون header مرورگر، HTTP 200 پس از internal proxy injection؛ هیچ secret header در response دیده نشد. standalone smoke نهایی روی پورت 3189: 11 check، exit 0.
  - Chromium desktop 1440×1000 و mobile 390×844: RTL، فرم، keyboard Tab و خروجی نمونه سالم؛ requestهای داخلی مشاهده‌شده 200.
  - warning مرورگر محلی: Google Tag Manager توسط CSP localhost block شد؛ هیچ failed request داخلی یا page error مرتبط مشاهده نشد.
  - `git diff --check`: exit 0.
- branch/commit: `growth/loop-20260808-funnel-baseline` / commit در مرحلهٔ تحویل ایجاد می‌شود.
- release status: `NOT_RELEASED`; این Loop هیچ deploy یا mutation production انجام نداد.
- earliest evaluation date: `T_release + 7d` و فقط پس از حداقل 30 `tool_start`.
- نتیجه: measurement-ready محلی؛ uplift یا conversion success هنوز قابل ادعا نیست.
- blocker باقی‌مانده: شروع evaluation وابسته به review، merge و release مستقل این branch است.
- هشدار dependency موجود: `pnpm audit --prod --audit-level high` شش advisory high و دو moderate در dependencyهای transitive موجود گزارش کرد؛ این cycle dependency/lockfile را تغییر نداد و remediation آن scope مستقل می‌خواهد.
