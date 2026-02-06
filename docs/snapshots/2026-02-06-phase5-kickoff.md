# Snapshot: Phase 5 Kickoff (Docs & Contribution Flow)

Date: 2026-02-06
Base Snapshot: `docs/snapshots/2026-02-06-phase1-4-progress.md`
Branch: main

## Audit (Real)

- `CONTRIBUTING.md` شامل ارجاع شکسته به `docs/README.md` بود.
- دستورهای تست در `CONTRIBUTING.md` با مسیر CI فعلی همگام نبودند (`pnpm check`/`pnpm test:e2e` به‌جای مسیر معیار `ci:quick` و `test:e2e:ci`).
- معیار پوشش تست در `CONTRIBUTING.md` و README با استاندارد رسمی پروژه همخوان نبود (۱۰۰٪ در مقابل حداقل ۸۵٪ برای ابزارهای اصلی).
- در مستندات، «راهنمای توسعه ابزارها» که در Phase 5 هدف‌گذاری شده بود وجود نداشت.

## Changes (Real)

- `CONTRIBUTING.md` بازآرایی شد با:
  - مسیر مشارکت مرحله‌ای و روشن
  - دستورات واقعی کیفیت/تست
  - DoD همسو با استانداردهای فنی و حریم خصوصی
- `docs/developer-guide.md` اضافه شد (راهنمای توسعه ابزار، UI، RTL/A11y/PWA/Privacy و الگوی تست واقعی).
- `docs/index.md` با لینک developer guide به‌روز شد.
- `README.md` از نظر معیار پوشش تست و فهرست مستندات به‌روز شد.
- `docs/roadmap.md` وضعیت شروع Phase 5 و انجام آیتم راهنمای توسعه را ثبت کرد.
- قالب PR در `.github/PULL_REQUEST_TEMPLATE.md` با gateهای واقعی (`ci:quick`, `test:e2e:ci`) و چک‌لیست استاندارد پروژه بازآرایی شد.
- قالب `feature request` در `.github/ISSUE_TEMPLATE/feature_request.md` اضافه شد.
- پیکربندی issueها در `.github/ISSUE_TEMPLATE/config.yml` اضافه شد تا issue بدون قالب بسته باشد.
- سند سیاست بازبینی در `docs/review-policy.md` اضافه شد.
- ارجاع‌های `CONTRIBUTING.md` و `docs/index.md` با اسناد/قالب‌های جدید همگام شد.
- وضعیت Phase 5 در `docs/roadmap.md` به «انجام شد» به‌روزرسانی شد.

## Validation (Real)

- `pnpm ci:quick` اجرا شد و به دلیل خطاهای lint از قبل موجود در چند فایل کدنویسی (غیرمرتبط با تغییرات مستندات این فاز) fail شد.
- `pnpm test:e2e:ci` اجرا شد: `21 passed / 16 failed`.
- شکست‌های E2E عمدتاً در این دسته‌ها بودند:
  - `tests/e2e/a11y.spec.ts` (color contrast)
  - `tests/e2e/tools.spec.ts` (انتظار پیام خطای فرم‌ها)
  - `tests/e2e/home.spec.ts` و `tests/e2e/flows-positive.spec.ts` (رگرسیون‌های جریان UI)
- نتیجه: فاز ۵ از نظر «اجرای واقعی ممیزی/تغییر/تست» شروع شد، اما baseline فعلی تست پروژه هنوز ناپایدار است و نیازمند پایدارسازی جداگانه است.

## Baseline Hardening (Follow-up, Real)

- خطاهای lint بلاکر در این فایل‌ها با `eslint --fix` رفع شدند:
  - `components/features/monetization/MonetizationAdminPage.tsx`
  - `components/features/tools-dashboard/ToolsDashboardPage.tsx`
  - `playwright.config.ts`
  - `shared/monetization/monetizationStore.ts`
  - `shared/ui/ToastProvider.tsx`
- برای رفع شکست‌های a11y:
  - رنگ‌های semantic در `app/globals.css` برای کنتراست AA تقویت شدند.
  - ورودی رنگ بدون label در `features/image-tools/image-tools.tsx` دارای `aria-label` شد.
- برای پایداری E2E:
  - تست‌های شکننده `home/tools/flows-positive` با selectorها و flowهای پایدارتر همسو شدند.
- برای کیفیت کد:
  - warningهای `no-non-null-assertion` در `lib/tools-registry.ts` با الگوی type-safe (`categoryOrThrow`) حذف شدند.
- برای پایداری پیکربندی:
  - `outputFileTracingRoot` در `next.config.mjs` تنظیم شد تا هشدار workspace root در اجرای Playwright حذف شود.
- برای انطباق با Next.js:
  - `middleware.ts` به `proxy.ts` مهاجرت کرد و تمام ارجاع‌های مستنداتی مرتبط به‌روزرسانی شد.
  - `tsconfig.json` نیز با `proxy.ts` همگام شد.
- نتیجه نهایی اجرای واقعی:
  - `pnpm ci:quick`: پاس
  - `pnpm test:e2e:ci`: پاس (`37/37`)

## Next

- ادامه فازهای بعدی roadmap.
