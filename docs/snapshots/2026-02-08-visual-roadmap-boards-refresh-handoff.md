# Snapshot — 2026-02-08 — Visual Roadmap Boards Refresh

## Summary

- بوردهای گرافیکی `roadmap` و `deployment` به یک طراحی یکپارچه و حرفه‌ای ارتقا داده شدند.
- داشبورد KPI، ناوبری اولویت‌ها، فیلتر وضعیت (همه/باز/انجام‌شده)، و پیشرفت هر ستون اضافه شد.
- قابلیت‌های قبلی (snapshot, import/export, local persistence) حفظ شدند.

## Updated Files

- `docs/roadmap-board.html`
- `public/roadmap-board.html`
- `docs/deployment-roadmap.html`
- `public/deployment-roadmap.html`

## UX Improvements

- Hero dashboard with visual KPIs
- Per-priority progress bars and counters
- Phase navigation sidebar for quick jumps
- Status filtering for open/done tasks
- Improved readability and visual hierarchy for task cards

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-visual-roadmap-boards-refresh-handoff.md

گام بعدی:
1) اگر لازم است، برای بوردها presetهای فیلتر (مثلاً Ready for Deploy / In Progress) اضافه کن.
2) خروجی PDF snapshot از وضعیت فعلی بوردها بساز.
3) docs/index.md و CHANGELOG.md را sync کن.
4) commit/push و snapshot نهایی بگیر.
```
