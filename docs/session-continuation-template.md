# ادامه کار بدون همراهی من (Template)

وقتی در یک جلسه نیستم، برای اینکه کار پروژه قطع نشه از این الگو استفاده کن.

## 1) قبل از شروع هر جلسه

```bash
# همگام‌سازی با ریپو

git checkout main
git pull --ff-only origin main
pnpm install

# صحت سریع
pnpm lint:ci
```

## 2) خلاصه وضعیت فعلی را قبل از هر تغییر ثبت کن

یک فایل کوتاه توی پیام/چت بساز با فرمت:

- **انجام‌شده:** ...
- **در حال انجام:** ...
- **باقی‌مانده/بسته‌نشده:** ...
- **فایل‌های touched:** ...
- **ریسک‌ها:** ...

## 3) برای DeepSeek استفاده از Template prompt

```text
من داخل repo persiantoolbox کار می‌کنم.
قصد دارم فقط روی فایل‌های زیر کار کنم: <list>
- خروجی فقط به‌صورت `diff` باشه.
- خروجی کوتاه، قابل اعمال، و بدون refactor غیرضروری.
- اگر شک داشتی، قبل از تغییرات سوال کن.

Task: ...
```

## 4) دستورهای اجرای محلی

```bash
pnpm ai:ask --providers=deepseek,openrouter "..."
pnpm ai:ask --providers=openai,deepseek "..."
```

## 5) قبل از commit

```bash
# حداقل تست‌های مرتبط
pnpm lint:ci
pnpm test:ci

# اگر تغییرات زیادی نبود
pnpm test -- <file>.test.ts
```

## 6) Commit

```bash
git status --short
git add <files>
git commit -m "chore: <خلاصه تغییر>"
git push origin main
```

## 7) اگر زمان قطع شد (Handoff آماده)

فایل زیر را کامل بروز کن تا نفر بعدی سریع وارد شود:

- چه شد
- دلیل توقف
- قدم بعدی دقیق
- دستورات تایید لازم

تعداد فایل‌های کلیدی جدید:

- `app/dashboard/page.tsx`
- `app/api/admin/ops/route.ts`
- `components/features/admin/OpsDashboardClient.tsx`
- `lib/admin/opsDashboard.ts`
- `scripts/admin/generate-ops-snapshot.mjs`
- `scripts/admin/run-ops-window.mjs`
- `ops/systemd/*`
- `docs/ROADMAP_REAL.md`
- `docs/ai-cost-helper.md`
