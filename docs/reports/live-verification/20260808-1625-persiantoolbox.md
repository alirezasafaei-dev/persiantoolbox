# گزارش release و live verification — 2026-08-08 16:25 EDT

## هویت release

- production فعلی: `01f64af154bc15d1b449b5ba9eb5a84b0b324f60`
- release candidate: `a911aeab3150a8d6723a30809c2ceb81074632df`
- branch: `main` و `feat/signup-gift-credit`
- commit قابلیت: `a911aeab feat(auth): grant one signup export credit`
- فاصلهٔ production تا candidate: 49 commit؛ production تغییر نکرد.
- rollback target: `01f64af154bc15d1b449b5ba9eb5a84b0b324f60`

## گیت‌های محلی

| بررسی | نتیجه |
| --- | --- |
| targeted Vitest | 59/59 pass |
| full Vitest | 204 file، 1667/1667 pass |
| typecheck / lint | exit 0 / exit 0 |
| licensing / local-first | exit 0 / exit 0 |
| deployment-safety + smoke tests | 32/32 pass |
| `pnpm ci:contracts` | exit 0؛ تمام contractها pass |
| production build | exit 0؛ 958 صفحه؛ standalone ساخته شد |
| standalone smoke | 11/11 route pass |
| `git diff --check` | exit 0 |

نکتهٔ محیطی: Node محلی 26، global experimental webstorage را فعال می‌کند؛ full Vitest با
`NODE_OPTIONS=--no-experimental-webstorage` اجرا شد تا رفتار Node 20 رسمی CI بازتولید شود.
build اولیه فقط به‌علت symlink موقت `node_modules` خارج از filesystem root توسط Turbopack رد شد؛
پس از نصب واقعی dependencyها در worktree، همان build سبز شد.

## Git و CI راه‌دور

- push شاخهٔ قابلیت: pass
- fast-forward push به `main`: pass
- SHA محلی و `refs/heads/main`: هر دو `a911aeab3150a8d6723a30809c2ceb81074632df`
- CodeQL، deploy-safety و lighthouse-ci: pass
- `ci-core`: fail
  - quality، build، contracts، licensing، smoke-asdev و shardهای E2E شماره 1 تا 3: pass
  - security-audit: dependency audit موجود در baseline (6 high و 2 moderate) fail
  - E2E shard 4: تست قدیمی Encrypt PDF در انتظار upload-area نامنطبق fail؛ همان failure محلی بازتولید شد.
- `deploy-gate`: fail به‌علت `ci-core`
- دریافت log کامل Actions با credential فعلی HTTP 403 داشت؛ metadata کامل job/step قابل مشاهده و ثبت شد.

این دو failure به فایل‌های signup gift مربوط نیستند، اما gate رسمی را قرمز نگه می‌دارند؛ در نتیجه
طبق policy هیچ production mutation انجام نشد و deploy engine اجرا نشد.

## بررسی read-only نسخهٔ زنده

- `https://persiantoolbox.ir/api/health`: HTTP 200، DB ready، commit فعلی مطابق production
- `https://persiantoolbox.ir/api/ready`: HTTP 200
- `https://persiantoolbox.ir/api/version`: HTTP 200، commit `01f64af...`
- مرورگر واقعی: Playwright/Chromium 1.58.1، desktop، homepage render و snapshot شد.
- broken URL مشاهده‌شده: ندارد (بررسی baseline محدود به homepage و endpointهای سلامت بود).
- navbar و footer در snapshot قابل مشاهده بودند؛ چون deploy انجام نشد، مجموعهٔ کامل post-deploy اجرا نشد.
- console baseline: دو CSP error برای Google Tag Manager و دو preload warning؛ پیش از release موجود بودند.
- page error / failed first-party network request در baseline محدود مشاهده نشد.
- mobile، 10 مقاله، تمام دسته‌ها و تعامل ابزارها: اجرا نشدند؛ این‌ها post-deploy هستند و deploy مسدود شد.

## نتیجهٔ کمپین signup gift در candidate

- ثبت‌نام و هدیه در یک transaction؛ UUID معتبر و grant idempotent.
- یک credit با اعتبار دقیق 7 روز؛ محصول دو-credit رد می‌شود.
- وضعیت‌های available/consumed/expired و copy فارسی اضافه شد.
- `POST /api/trial` حذف و status logged-out بدون دادهٔ حساس است.
- `trial` در pricing/checkout عمومی عرضه نمی‌شود؛ `pack-3` همان 3 credit و 49,000 تومان است.
- refund بر اساس `credit_cost` و انتقال trial به pack-3 با سه credit کامل اصلاح شد.
- PATCH reservation احراز هویت و ownership دارد؛ محتوای سند/فایل به credit یا analytics افزوده نشد.

## هشدارها و اقدام لازم

- production هنوز release candidate را اجرا نمی‌کند.
- dependency audit و E2E Encrypt PDF باید در scope جداگانه اصلاح و `ci-core` و `deploy-gate` سبز شوند.
- پس از سبز شدن gateها، همین SHA یا descendant بازبینی‌شده باید با
  `RUN_MIGRATIONS=false` و `ALLOW_RECOVERY_DEPLOY=false` از engine رسمی deploy و سپس کامل browser-verified شود.

DEPLOY_BLOCKED_NOT_VERIFIED
