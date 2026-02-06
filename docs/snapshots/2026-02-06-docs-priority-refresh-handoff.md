# Snapshot: Docs Priority Refresh (Handoff)

Date: 2026-02-06
Branch: main

## Audit (Real)

- نقشه‌راه‌ها در چند سند هنوز فاز/مرحله‌محور بودند.
- بخشی از مستندات عملیات با وضعیت واقعی کد ناهم‌راستا بود (به‌خصوص مسیر Prisma و install clean).
- دو بورد HTML (`roadmap-board`, `deployment-roadmap`) نیاز به خوانایی بهتر با مدل اولویت داشتند.

## Changes (Real)

- اسناد هسته به مدل «اولویت + ترتیب اجرا» منتقل شدند:
  - `docs/roadmap.md`
  - `docs/deployment-roadmap.md`
  - `docs/operations.md`
  - `docs/monetization/roadmap.md`
  - `docs/monetization/task-plan.md`
- فهرست مستندات و راهنماها هم‌راستا شدند:
  - `docs/index.md`
  - `README.md`
  - `CONTRIBUTING.md`
  - `docs/project-standards.md`
  - `docs/developer-guide.md`
  - `docs/review-policy.md`
  - `docs/daily-checklist.md`
- دو بورد HTML به ساختار اولویت‌محور تبدیل شدند:
  - `docs/roadmap-board.html`
  - `docs/deployment-roadmap.html`
- نسخه‌های `public/` نیز با `docs/` همسان شدند:
  - `public/roadmap-board.html`
  - `public/deployment-roadmap.html`

## Validation (Real)

- بازبینی ساختار و محتوای مستندات انجام شد.
- همسان‌سازی `docs/` و `public/` برای بوردهای HTML انجام شد.

## Next Chat Start Point

1. بستن آیتم‌های اولویت 1 در `docs/roadmap.md` (پایداری install/build و مسیر دیتابیس).
2. بستن آیتم‌های اولویت 1 و 2 در `docs/monetization/task-plan.md` (consent/ingest امنیتی).
3. همگام‌سازی workflowهای CI با گیت‌های تعریف‌شده در `docs/operations.md`.
