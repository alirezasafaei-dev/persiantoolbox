# وظایف کدکس — SEO/GEO، 2026-09-28

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** تکمیل شواهد SEO/GEO و آماده‌سازی تغییرات محدود برای بازبینی.
**Architecture:** ابتدا داده و وضعیت کاندیدا تطبیق می‌یابد؛ سپس هر نقص در PR مستقل بررسی می‌شود. اجرا به شاخهٔ production دست نمی‌زند.
**Tech Stack:** Next.js، TypeScript، pnpm، Vitest، Playwright و Google Search Console API.
**Spec:** [ROADMAP.md](ROADMAP.md) و [EVIDENCE.md](EVIDENCE.md).
**Global Constraints:** مرزهای مجوز، privacy و حفظ URL در ROADMAP.md برای همهٔ تسک‌ها لازم‌الاجراست.

## Review Focus

- stale/partial data و اختلاط host: SG28-00 با provenance و totals مستقل.
- ادعای اعتبار رسمی یا حریم خصوصی نادرست: SG28-02/04 با تطبیق UI/schema/behavior.
- canonical/noindex روی صفحات پربازدید: SG28-03 با URL evidence و regression test.
- telemetry حساس یا بدون consent: SG28-06 با consent/no-sensitive-payload checks.
- DPI به‌جای zoom یا timeout به‌جای performance: SG28-07 با GUI evidence و cold/warm profiling.

مالک اجرا: Codex CLI با حساب `c2`. هماهنگی/بازبینی: ChatGPT. تصمیم انتشار: مالک.
READY = قابل شروع؛ BLOCKED = وابستگی مشخص؛ REVIEW = آمادهٔ بازبینی؛ DONE = خروجی با شاهد.
این جدول فقط وضعیت کارهای SG28 را نگه می‌دارد؛ هیچ مأموریت خودکاری enqueue نشده است.

پیش‌نیاز اجرای CLI: نشست c2 در ۲۸ سپتامبر خطای احراز هویت داشت و نیازمند ورود دوبارهٔ مالک است. READY یعنی دامنه و ورودی تسک آماده است، نه اینکه عامل هم‌اکنون اجرا شده باشد.

| ID      | اولویت | وضعیت   | وابستگی                                             | خروجی                               |
| ------- | ------ | ------- | --------------------------------------------------- | ----------------------------------- |
| SG28-00 | P0     | BLOCKED | پاسخ 403 GSC                                        | snapshot تازه و مقایسهٔ ۲۸روزه      |
| SG28-01 | P0     | READY   | دادهٔ ذخیره‌شده برای شروع؛ SG28-00 برای نتیجهٔ تازه | تشخیص افت آدرس و افت‌های مالی       |
| SG28-02 | P0     | READY   | شاخهٔ کاندیدای محلی موجود                           | بازبینی و PR کاندیدا بدون تکرار کار |
| SG28-03 | P0     | READY   | دسترسی عمومی؛ export علت‌ها برای نتیجهٔ GSC         | تشخیص sitemap و indexability        |
| SG28-04 | P1     | BLOCKED | SG28-02 و تأیید gap واقعی                           | تغییر محدود intent/content          |
| SG28-05 | P1     | READY   | کد و HTML عمومی؛ UI مجاز برای بخش حساب              | مبنای فنی و محتوایی GEO             |
| SG28-06 | P1     | READY   | analytics مجاز برای عدد واقعی                       | طرح و baseline سنجش GEO             |
| SG28-07 | P2     | READY   | GUI برای zoom؛ محیط کنترل‌شده برای performance      | تکمیل شواهد UX/عملکرد               |
| SG28-08 | P2     | BLOCKED | انتشار با مجوز جدا و دوره‌های کامل                  | گزارش اثر پس از انتشار              |

## SG28-00 — دریافت تازه و بازتولیدپذیر

- [ ] runbookهای `docs/ops/gsc-readonly-service-account.md` و `docs/runbooks/gsc-readonly-access.md` خوانده شود.
- [ ] با scope readonly و کلید موجود خارج Git، sites.list و یک query کوتاه probe شود؛ status/error class بدون token ثبت شود. خطای HTML شبکه با JSON permission/quota اشتباه نشود. retry محدود، بدون تغییر مجوز یا نصب واسطه ناشناس.
- [ ] آخرین روز final با dimension=date تعیین شود. دو بازهٔ ۲۸روزه بدون هم‌پوشانی استخراج شود؛ totals و page/query/page-query/device/country/daily، main host جدا از کل property.
- [ ] pagination تا پایان با rowLimit حداکثر 25000، تعداد ردیف، aggregation type، مرز زمانی و محدودیت داده ثبت شود. aggregate بدون query مبنای totals باشد.
- [ ] raw export خصوصی؛ گزارش تجمیعی در `docs/growth/seo-geo-2026-09-28/reports/gsc-refresh.md` ایجاد شود. ابزار موجود `scripts/quality/analyze-gsc-performance-export.mjs` ابتدا بررسی شود؛ تغییر collector فقط در تسک مستقل با تست fixture بدون credential.
- پذیرش: تاریخ fetch و آخرین final day، فرمول CTR/position، جمع‌زدن صحیح و عدم مخلوط‌کردن hostها؛ یا BLOCKED با کوچک‌ترین اقدام لازم. دادهٔ ۲۶ سپتامبر به نام دادهٔ امروز ثبت نشود.

## SG28-01 — حفظ برنده و تشخیص افت

فایل‌های بررسی: `app/(tools)/text-tools/address-fa-to-en/page.tsx`، `features/text-tools/address-fa-to-en/content.ts`، `lib/tool-metadata-overrides.ts`؛ تست‌های موجود address-fa-to-en.

- [ ] اختلاف query، device، country و روزهای همسان برای صفحه آدرس بررسی شود؛ نبود segment در export قدیمی صریح ثبت شود.
- [ ] HTML، canonical، robots، لینک داخلی و URL Inspection در صورت دسترسی بررسی شود؛ نمونه SERP دستی با زمان/کشور/زبان ثبت شود.
- [ ] افت mahr-calculator، check-penalty و salary در بخش مستقل بررسی شود؛ تقاضا از مشکل ranking/canonical تفکیک شود.
- [ ] `reports/winner-diagnosis.md` با فرضیه، شاهد موافق/مخالف و تصمیم «تغییر محدود» یا «بدون تغییر» ایجاد شود.
- پذیرش: علت قطعی فقط با شاهد؛ عنوان/slug ابزار آدرس بدون اثبات defect دست‌نخورده. اگر تغییر کد لازم شد، ابتدا regression test مشخص سپس PR مستقل.

## SG28-02 — تطبیق و بازبینی کاندیدا

ورودی محلی: `codex/pt05-gsc-primary-20260926`، SHA کوتاه `d075e2f9`؛ base بررسی‌شده `1b944f90`. در شروع SHA کامل و وضعیت فعلی را دوباره بخوان.

- [ ] diff با main و PRهای موجود بررسی شود؛ ۹ commit دوباره ساخته نشود و شاخه legacy push نشود.
- [ ] metadata، registry، HTML، FAQ و schema با رفتار واقعی و premium/export gates تطبیق یابند.
- [ ] ادعای checksum برای postal-code در `public/llms.txt` با پیاده‌سازی بررسی و اگر بی‌پشتوانه بود حذف شود. ادعای مطلق حریم خصوصی work-certificate در schema/HTML بررسی شود.
- [ ] آزمون محتوایی رفتار/خروجی را بسنجد؛ grep source به‌تنهایی اثبات رندر نیست. مسیرهای دارای type محدود با API مناسب registry خوانده شوند.
- [ ] گیت‌ها روی SHA نهایی، Signed-off-by، push بدون force و PR مستقل؛ بدون merge/deploy. گزارش `reports/candidate-review.md`.
- پذیرش: هیچ Critical/Important باز نماند؛ `pnpm ci:quick`، `pnpm ci:contracts`، `pnpm build` و smoke canonical و E2E مرتبط با نتیجه واقعی. Windows failure و Linux CI جدا؛ CI قدیمی به SHA جدید نسبت داده نشود.

## SG28-03 — sitemap و indexability

فایل‌ها: `app/sitemap.ts`، `app/robots.ts`، `scripts/quality/audit-sitemap-indexability.mjs`، `scripts/quality/analyze-gsc-coverage-export.mjs`؛ تست‌های `tests/unit/sitemap-*.test.ts`.

- [ ] sitemap اصلی و llm از مسیر مجاز دوم با درخواست محدود بررسی شوند؛ DNS/TLS/HTTP و XML جدا گزارش شوند. SSL verification خاموش نشود.
- [ ] علت واقعی 19 warning و 1 error تاریخی از UI/export مجاز دریافت شود؛ شمارنده قدیمی با وضعیت زنده قاطی نشود.
- [ ] نمونهٔ محدود از URLهای اولویت‌دار، redirect، noindex، canonical، duplicate و soft404 بررسی شود؛ robots allow معادل indexed نیست.
- [ ] گزارش `reports/indexability.md` با جدول URL/شاهد/تصمیم ایجاد شود. اصلاح route/sitemap فقط پس از بازتولید defect و تست failing سپس passing.
- پذیرش: بدون حذف کور URL، تغییر cross-host canonical، submit/delete sitemap یا درخواست indexing. در نبود export علت‌ها، بخش GSC همچنان BLOCKED.

## SG28-04 — اصلاح intent با دامنه محدود

فایل‌های کاندیدا: `lib/tools-registry.ts`، `lib/tool-metadata-overrides.ts`، صفحات work-certificate، add-page-numbers، weekday-finder و document-studio. تست‌های SEO موجود را در شاخهٔ انتخاب‌شده دوباره فهرست کن.

- [ ] از گزارش SG28-02 یک gap اجرا‌نشده انتخاب کن؛ ترتیب بررسی: extract-pages، date-difference، national-id، age-calculator؛ سپس اسناد.
- [ ] intent، عنوان/توضیح فعلی، پاسخ کوتاه، مثال و محدودیت واقعی را در گزارش پیش از تغییر ثبت کن.
- [ ] یک تغییر قابل‌سنجش در یک خوشه؛ FAQ در UI واقعاً دیده شود و schema همان پاسخ را بازتاب دهد. لینک داخلی فقط برای ادامهٔ کار.
- [ ] تست خروجی metadata/SSR، canonical، keyboard/RTL و مسیر موفق ابزار اجرا شود؛ قیمت/پردازش فایل/الگوریتم تغییر نکند.
- پذیرش: `reports/content-experiment.md` با فرضیه و شاخص قبل؛ گیت‌های application از AGENTS.md؛ بدون ادعای رشد قبل از انتشار.

## SG28-05 — GEO فنی و صحت محتوا

فایل‌های بررسی: `app/robots.ts`، `public/llms.txt`، `lib/seo.ts` و صفحات هدف؛ `tests/unit/seo-jsonld-contract.test.ts`.

- [ ] HTML قابل‌خواندن، لینک canonical، هویت ناشر، ادعای محلی/رسمی و schema همسان بررسی شود.
- [ ] نقش crawler جستجو/آموزش جدا؛ wildcard فعلی بررسی شود. سیاست آموزش یا مسیرهای خصوصی خودکار تغییر نکند.
- [ ] گزارش Generative AI و وضعیت inclusion در GSC فقط خواندنی بررسی شود؛ نبود report/data برابر صفر نیست. پشتیبانی API از مستندات همان روز بررسی شود.
- [ ] `reports/geo-readiness.md` با PASS/FAIL/NOT_RUN و منابع رسمی تاریخ‌دار؛ llms.txt KPI نباشد.
- پذیرش: نقص واقعی با تست محدود اصلاح شود؛ هیچ ادعای citation/ranking بدون شاهد یا صفحه انبوه تولید نشود.

## SG28-06 — baseline سنجش GEO و تبدیل

فایل‌های بررسی: `docs/growth/analytics-contract.md`، `docs/growth/analytics-coverage-matrix.md`، `shared/analytics/events.ts`، `shared/analytics/useToolAnalytics.ts`، `shared/consent/analyticsConsent.ts`.

- [ ] ۱۲ سؤال عمومی ثابت در چهار خوشه تعریف و engine/time/locale/citation ثبت شود؛ اجرای انجام‌نشده NOT_RUN.
- [ ] با analytics مجاز موجود، referral و شروع/تکمیل ابزار به‌صورت تجمیعی بررسی شود. self-referral، bot و UTM جعلی فیلتر شوند؛ referrer ناقص محدودیت دارد.
- [ ] baseline گزارش Generative AI در صورت دسترسی جدا از Web totals ثبت شود؛ UI و API را یکسان فرض نکن.
- [ ] `reports/geo-measurement.md` شامل روش نمونه‌گیری، denominator، مجهولات و برنامهٔ ارزیابی باشد.
- پذیرش: بدون فایل/متن/آدرس/شناسه کاربر، بدون tracker جدید؛ اگر instrumentation ضروری شد ابتدا طرح مستقل و تست consent/no-sensitive-payload.

## SG28-07 — باقی‌ماندهٔ تجربه و عملکرد

فایل‌ها: `tests/e2e/mobile-ux.spec.ts` و گزارش تاریخی `docs/growth/homepage-ui-seo-2026-09/reports/post-merge-handoff.md`.

- [ ] زوم واقعی مرورگر 200% در روشن/تاریک با screenshot، کنترل‌های قابل‌دسترسی و overflow بررسی شود؛ DPR2 معادل zoom نیست.
- [ ] در صورت نبود GUI، NOT_RUN با گام دستی دقیق. تصویر قبلی به نتیجهٔ جدید نسبت داده نشود.
- [ ] timeout پنج‌ثانیه‌ای با عملکرد سایت یکی نیست؛ cold start فقط فرضیه است. profiling تکرارپذیر در محیط غیرproduction با نمونه cold/warm و سه اجرای mobile median.
- پذیرش: `reports/ux-performance.md`؛ بدون load test، cache purge یا restart production؛ فقط defect بازتولیدشده وارد PR اصلاحی شود.

## SG28-08 — ارزیابی پس از انتشار مجاز

- [ ] فقط بعد از دستور جداگانهٔ مالک، SHA و زمان انتشار از شواهد واقعی خوانده شود؛ این task مجوز انتشار نیست.
- [ ] baseline و cohortها freeze؛ داده final دو دوره کامل ۲۸روزه، host/query/device یکسان و تغییرات هم‌زمان ثبت شود.
- [ ] `reports/post-release-evaluation.md` با نتیجه supported / inconclusive / regression؛ مقایسه observational علت قطعی نیست.
- پذیرش: KPI سئو، GEO و استفاده ابزار تفکیک؛ بدون rollback خودکار.

مسیرهای کوتاه reports/ در این برنامه نسبت به docs/growth/seo-geo-2026-09-28/ هستند و فایل خروجی باید هنگام اجرای تسک ایجاد شود.

## قرارداد تحویل هر تسک

ID، base/head SHA، فایل‌های تغییرکرده، فرمان و exit code، لینک PR/CI همان SHA، داده و زمان آن، blocker و کوچک‌ترین گام بعدی. commit با Signed-off-by؛ worktree مستقل clean؛ checkout کاربر حفظ شود. اجرای تسک در گزارش با DONE علامت نخورد تا شاهد ثبت شود.
