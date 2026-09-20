# گزارش اجرای بسته PR #43 — homepage UI/SEO

## هویت

- Task IDs و وضعیت: PT-00 DONE، PT-01 DONE، PT-02 REVIEW، PT-03 REVIEW، PT-04 DONE، PT-05 BLOCKED، PT-06 BLOCKED.
- Branch / base SHA / candidate SHA: `codex/pr43-homepage-ui-seo-exec` / `origin/docs/homepage-ui-seo-program-20260920`=`c201a8fbd070a978538a0d8118263eab5b8b8279` / کد اصلاح helper آزموده‌شده در `17bb72bfe4b5c556e2cc6c84a3f9465126da3685`؛ این گزارش در commit بعدی نگهداری شده است.
- PR URL و base branch: stacked PR به `docs/homepage-ui-seo-program-20260920`؛ پس از push در خروجی نهایی ثبت می‌شود.
- Production SHA مشاهده‌شده و زمان UTC: `7b743046b9f3d652ecfc2d2f2a64274550e2e21f`، مشاهده‌شده در 2026-09-20.
- وضعیت worktree و commitهای مربوط: worktree مستقل؛ `fdba7289` یکسان‌سازی هویت SEO و `83bd1b64` اصلاح هیرو/کارت‌ها. checkout اصلی دست‌نخورده و تغییرات مالک حفظ شده‌اند.

## تغییر و دلیل

- JSON-LD صفحه خانه اکنون یک Organization و WebSite پایدار دارد؛ publisher و `isPartOf` ارجاع یکسان دارند و متن حریم خصوصی visible/schema همسان و scoped است.
- هیرو و کارت‌های وظیفه با CSS Module scoped بازطراحی شدند: سلسله‌مراتب خواناتر، teal محدود، focus واضح، RTL/دارک‌مود و responsive حفظ شد.
- آزمون‌های E2E جستجوی فارسی، CTAها، anchor، overflow موبایل و consent ایزوله شدند؛ fallbackهای ناامن حذف شدند.
- PT-04 فقط تشخیص و پیشنهاد است؛ رفتار اعلان‌ها تغییر نکرده و برای اصلاح نیازمند تأیید مالک است.
- علت شکست CI #35532406714/job `106135221902`: دو span تزئینی با bounds خام خارج viewport بودند، اما هر دو فرزند `section.heroShell` با `overflow: hidden` بودند؛ helper clipping اجداد را در محاسبه لحاظ نمی‌کرد. screenshot/trace همان اجرای local production این دو مورد را با متن خالی و ancestor clipping تأیید کرد.
- اصلاح: `getVisibleHorizontalOverflow` اکنون bounds قابل‌مشاهده را با تقاطع ancestorهای دارای `overflow-x` غیرvisible یا `clip-path` محاسبه می‌کند؛ بیرون‌زدگی واقعی همچنان fail می‌شود. assertion حذف یا skip نشده و CSS سراسری تغییر نکرده است.
- تغییر خارج از فهرست اولیه: هیچ dependency یا deploy تغییر نکرد؛ تنظیم موقت Playwright فقط برای اجرای Windows پاک شد.

## شواهد

| فرمان یا سناریو | نتیجه | مسیر artifact یا لینک |
| --- | --- | --- |
| تست واحد schema/copy | PASS، 16/16 | `tests/unit/homepage-seo-contract.test.ts` |
| `pnpm ci:quick` | FAIL فقط 1 تست pre-existing ویندوزی: `site-settings-storage` با EPERM در `rmSync`؛ lint/typecheck و 1750 تست vitest موفق | خروجی اجرای محلی؛ `tests/unit/site-settings-storage.test.ts` |
| `pnpm ci:contracts` | PASS | خروجی اجرای محلی |
| `pnpm build` | PASS، 656 صفحه؛ warningهای موجود Edge/runtime و trace ادمین | خروجی اجرای محلی |
| `pnpm predeploy:smoke` | FAIL، wrapper POSIX env روی PowerShell | — |
| `pnpm smoke:local` با env معادل PowerShell | PASS، 11 route | خروجی اجرای محلی |
| E2E جستجو/CTA/a11y/consent/schema | PASS، 39/39 | `tests/e2e/home.spec.ts` و suiteهای مرتبط |
| موبایل/دسکتاپ روشن/تاریک | PASS؛ بدون overflow و یک H1 در 360/390/768/1440 و zoom 200% | `reports/baseline/screenshots/` و `reports/candidate/screenshots/` |
| Lighthouse هم‌شرایط | baseline median: Perf 77، LCP 5592.2ms، CLS 0، TBT 69، FCP 2142.2ms؛ candidate median: Perf 75، LCP 5742.14ms، CLS 0، TBT 73، FCP 2442.14ms؛ delta در budget برنامه، CLS بدون تغییر | `reports/baseline/lighthouse/` و `reports/candidate/lighthouse/` |
| PT-04 controlled overlay reproduction | PASS؛ unknown consent overlap confirmed; accepted/rejected and dismissal states measured | `reports/overlay-diagnosis.md` |
| CI run `35532406714` قبل از اصلاح | FAIL فقط `e2e-chromium (2)`؛ سه homepage test در `mobile-ux.spec.ts:61`; سایر shardها و quality/build/contracts موفق | [failed job](https://github.com/alirezasafaeigfx/persiantoolbox/actions/runs/35532406714/job/106135221902) |
| CI run `35534545010` و LHCI پس از اصلاح روی SHA `17bb72b` | PASS؛ quality، build، contracts، licensing، security، smoke، هر ۴ shard E2E و LHCI موفق | [ci-core](https://github.com/alirezasafaeigfx/persiantoolbox/actions/runs/35534545010) · [lighthouse](https://github.com/alirezasafaeigfx/persiantoolbox/actions/runs/35534545066) |
| بازتولید production محلی قبل از اصلاح | FAIL همان دو span clipping‌شده در iPhone SE/14/S21؛ screenshot و trace در `test-results/` محلی تولید شد | `tests/e2e/mobile-ux.spec.ts` |
| بازتولید پس از اصلاح | NOT_RUN کامل؛ targeted run از assertion عبور کرد اما در همان تست موجودِ touch-target loop روی target ناپایدار `nth(8)` timeout شد؛ این failure جدید به helper نسبت داده نمی‌شود | خروجی اجرای محلی این مرحله |

## حدود و ادامه

- یافته قطعی: خطر هم‌پوشانی consent/install در consent نامعلوم بازتولید شد. فرضیه hydration در dev log `/loan` ثبت شد اما E2E همان مسیر PASS است و خارج از دامنه این بسته است.
- مانع‌های جدا: تست `site-settings-storage` روی Windows به‌علت singleton `node:sqlite` و حذف temp dir fail می‌شود، اما `ci:quick` روی Linux CI در run 35532406714 موفق بود؛ کوچک‌ترین اقدام، اصلاح lifecycle/cleanup تست یا حفظ اجرای gate روی Linux است. wrapper `predeploy:smoke` نیز روی PowerShell به‌علت env syntax POSIX fail می‌شود؛ این دو مورد خارج از اصلاح homepage باقی ماندند.
- GSC داده واقعی در دسترس نبود؛ PT-05 عمداً BLOCKED و هیچ محتوای جدیدی منتشر نشد.
- بله، یک تست قبل از تغییر نیز همین failure محیطی را داشت؛ failure به homepage مربوط نیست.
- MERGED: no. DEPLOYED: no.
- OWNER_VISUAL_APPROVAL: جهت طراحی قبلاً تأیید شده؛ تأیید نهایی این candidate هنوز yes نشده است.
- اقدام بعدی: push این اصلاح، انتظار exact-head CI و ثبت نتیجه واقعی آن؛ در صورت سبز شدن، PT-03 به REVIEW برمی‌گردد. Lighthouse تکرار نشد چون اصلاح فقط helper تست است و معیار performance تغییر نمی‌کند. merge/deploy فقط با دستور صریح مالک.
