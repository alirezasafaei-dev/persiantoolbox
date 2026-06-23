# Agent Governance - PersianToolbox

**Last Updated**: 2026-06-23
**Status**: ✅ Active
**Version**: v6.4.0

---

## 🚀 دستور سریع: شروع برنامه رشد

> وقتی کاربر بگه **"برنامه رشد رو شروع کن"** یا **"growth plan"**، این مراحل رو بدون توقف اجرا کن:

### مراحل اجرا (خودکار، بدون توقف)

```
۱. بخون: docs/roadmap.md → بخش "وضعیت اجرا" → ببین چی باقی مونده
۲. بخون: docs/roadmap.md → بخش "برنامه‌ریزی شده" → اولویت‌بندی کن
۳. اجرا کن: هر آیتمی که status "📋" یا "🔄" داره
۴. بعد از هر آیتم: typecheck + lint + test
۵. بعد از هر ۳-۵ آیتم: build + deploy
۶. بروزرسانی: docs/roadmap.md + package.json version
۷. کامیت + push
```

### قوانین اجرا

- **بدون توقف** — تا آیتم‌های باقی‌مانده تموم نشده متوقف نشو
- **بدون سؤال** — فقط برای موارد مخرب یا تغییرات بزرگ تأیید بگیر
- **ابزار واقعی** — هر ابزار باید کامل و بر اساس حقیقت باشه
- **lint/typecheck/test** — قبل از هر deploy اجرا بشه
- **RTL + Dark Mode** — در تمام کامپوننت‌ها حفظ بشه
- **فارسی‌اول** — تمام متن‌ها فارسی باشه
- **پردازش محلی** — تمام ابزارها در مرورگر کار کنن
- **Signed-off-by** — هر کامیت شامل DCO trailer باشه

---

## 📜 Governance

This project uses a **DCO + CLA Hybrid** governance model:

- **[DCO.md](DCO.md)** — Developer Certificate of Origin for all contributors
- **[cla-individual.md](docs/licensing/cla-individual.md)** — Individual Contributor License Agreement
- **[cla-corporate.md](docs/licensing/cla-corporate.md)** — Corporate Contributor License Agreement

All commits must include a `Signed-off-by` trailer per the DCO process.

---

## 🤖 Agent Guidelines

### Agent Working Directory

- **Base Path**: `/home/dev13/my-project/sites/live/persiantoolbox`
- **Allowed Directories**: `src/`, `scripts/`, `docs/`, `tests/`, `packages/`, `app/`, `lib/`, `components/`, `shared/`, `features/`, `content/`
- **Restricted Directories**: `.git/`, `node_modules/`, `.next/`, `dist/`, `.turbo`

### Key Commands

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Tests
pnpm vitest --run

# Build
pnpm build

# Deploy (requires VPS SSH access)
bash deploy-vps-auto.sh
```

### Deployment

- **VPS**: 193.93.169.32 (user: ubuntu, port: 22)
- **Deploy script**: `bash deploy-vps-auto.sh`
- **Process manager**: PM2 (app name: persiantoolbox)
- **Health check**: `curl https://persiantoolbox.ir/api/health`
- **Deploy flow**: rsync → pnpm install → build → copy static → restart PM2

### Tech Stack

- **Framework**: Next.js 16 (App Router, standalone output)
- **Runtime**: Node.js 20
- **Language**: TypeScript (strict mode)
- **CSS**: Tailwind CSS + CSS custom properties
- **Database**: PostgreSQL (for auth, sessions, history)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Package Manager**: pnpm

---

## 📊 وضعیت فعلی پروژه

### آمار

- **ابزارها**: ۵۵ ابزار واقعی در ۶ دسته‌بندی (۴ ابزار کم‌ارزش حذف شد)
- **بلاگ**: ۳۳ مقاله آموزشی
- **تست‌ها**: ۴۲۱ تست واحد + ۴۳ E2E — همه PASS
- **صفحات**: ۲۲۱ صفحه SSG (شامل OG images)
- **نسخه**: v6.4.0
- **آدرس**: https://persiantoolbox.ir
- **دیتابیس**: PostgreSQL (localhost:5432)
- **لاگین/ثبت‌نام**: فعال و کار میکنه
- **Chrome Extension**: packages/chrome-extension
- **Telegram Bot**: packages/telegram-bot
- **FAQ Schema**: تمام صفحات ابزار
- **Badges**: سیستم امتیاز کاربر
- **Share**: اشتراک‌گذاری نتایج
- **Dark Mode**: بهبود یافته (تمام صفحات CSS variables)
- **Accessibility**: بهبود یافته (dialog roles, aria-labels فارسی)
- **Localization**: تمام متن‌های UI فارسی شد

### دسته‌بندی ابزارها

| دسته       | تعداد | مسیر                 |
| ---------- | ----- | -------------------- |
| مالی       | ۱۹    | /tools/\*            |
| PDF        | ۱۶    | /pdf-tools/\*        |
| متنی       | ۸     | /text-tools/\*       |
| تصویر      | ۵     | /image-tools/\*      |
| تاریخ      | ۴     | /date-tools/\*       |
| اعتبارسنجی | ۲     | /validation-tools/\* |

### فلگ‌های ویژگی

| فلگ                 | وضعیت   |
| ------------------- | ------- |
| auth                | ✅ فعال |
| account             | ✅ فعال |
| subscription        | ✅ فعال |
| plans               | ✅ فعال |
| checkout            | ✅ فعال |
| dashboard           | ✅ فعال |
| ads                 | ✅ فعال |
| admin-site-settings | ✅ فعال |
| admin-monetization  | ✅ فعال |
| developers          | ✅ فعال |
| history             | ✅ فعال |
| history-share       | ✅ فعال |
| support             | ✅ فعال |

---

## 📋 نقشه راه — وضعیت اجرا

### انجام شده ✅ (v3.9.0 → v6.4.0)

| #   | آیتم                                                  | نسخه   |
| --- | ----------------------------------------------------- | ------ |
| ۱   | داشبورد ادمین (analytics, content, tools, users, ops) | v3.9.0 |
| ۲   | سیستم بلاگ (33 مقاله، Markdown، SSG)                  | v4.0.0 |
| ۳   | Charts CSS-only (Bar, Line, Pie, Sparkline)           | v4.0.0 |
| ۴   | RBAC (admin/editor/user) + AdminSidebar               | v4.0.0 |
| ۵   | اشتراک تاریخچه (API + UI)                             | v4.1.0 |
| ۶   | صفحه مقایسه ابزارها (/compare)                        | v5.0.0 |
| ۷   | صفحه Use Case (/use-cases)                            | v5.0.0 |
| ۸   | رزومه‌ساز آنلاین                                      | v5.0.0 |
| ۹   | Schema markup (HowTo, AggregateRating)                | v5.0.0 |
| ۱۰  | CTA صفحه اصلی بهبود یافته                             | v5.0.0 |
| ۱۱  | QR Code سفارشی                                        | v5.0.0 |
| ۱۲  | ابزار امضای آنلاین                                    | v6.0.0 |
| ۱۳  | Breadcrumb visible در UI                              | v6.2.0 |
| ۱۴  | Dark mode کامل (تمام صفحات)                           | v6.2.0 |
| ۱۵  | UpgradeModal accessibility                            | v6.2.0 |
| ۱۶  | متن‌های انگلیسی → فارسی                               | v6.2.0 |
| ۱۷  | Mobile menu حساب کاربری                               | v6.2.0 |
| ۱۸  | Footer لینک تلگرام + بلاگ                             | v6.2.0 |
| ۱۹  | Enamad seal alt text فارسی                            | v6.2.0 |
| ۲۰  | Payment pages SiteShell                               | v6.2.0 |
| ۲۱  | Dark mode hardcoded colors → CSS variables            | v6.3.0 |
| ۲۲  | Financial constants centralization                    | v6.3.0 |
| ۲۳  | Blog → Tool internal linking (BlogToolCTA)            | v6.3.0 |
| ۲۴  | AggregateRating schema for tools                      | v6.3.0 |
| ۲۵  | Footer reorganization (3 columns + trust signals)     | v6.3.0 |
| ۲۶  | Mobile menu search link                               | v6.3.0 |
| ۲۷  | Homepage CTA + category quick-links                   | v6.3.0 |
| ۲۸  | Tax calculator: fix double-exemption bug              | v6.3.0 |
| ۲۹  | Currency converter: Toman display + rounding          | v6.3.0 |
| ۳۰  | Fix ugly hover underline on buttons/cards             | v6.3.0 |
| ۳۱  | De-index useless tools (bank-rate, living-cost, etc)  | v6.3.0 |
| ۳۲  | Homepage rebuild (categories, newest, social proof)   | v6.3.0 |
| ۳۳  | Support page: real help center (not donation)         | v6.3.0 |
| ۳۴  | Back button on all tool/category pages                | v6.3.0 |
| ۳۵  | Financial tools dashboard redesign                    | v6.3.0 |
| ۳۶  | Payslip (فیش حقوقی) export                            | v6.3.0 |
| ۳۷  | Topics page redesign with tool cards                  | v6.3.0 |
| ۳۸  | Terms page expanded (5 sections)                      | v6.3.0 |
| ۳۹  | CSRF proxy support                                    | v6.3.0 |
| ۴۰  | PostgreSQL setup on VPS                               | v6.3.0 |
| ۴۱  | PDF→Word converter                                    | v6.3.0 |
| ۴۲  | حذف پس‌زمینه تصویر (AI)                               | v6.3.0 |
| ۴۳  | OG image خودکار (45+ صفحه)                            | v6.3.0 |
| ۴۴  | Salary hub (7 tabs)                                   | v6.3.0 |
| ۴۵  | Admin panel: social, contact, SEO, API keys           | v6.3.0 |
| ۴۶  | ذخیره سناریو + مقایسه + خروجی JSON/CSV                | v6.4.0 |
| ۴۷  | Smart CTA (3→signup, 5→premium)                       | v6.4.0 |
| ۴۸  | Exit intent popup                                     | v6.4.0 |
| ۴۹  | Chrome Extension                                      | v6.4.0 |
| ۵۰  | Telegram Bot                                          | v6.4.0 |
| ۵۱  | A11y fixes (Persian aria-labels, image priority)      | v6.4.0 |
| ۵۲  | FAQ schema سراسری                                     | v6.4.0 |
| ۵۳  | Social proof + badges system                          | v6.4.0 |
| ۵۴  | اشتراک‌گذاری نتایج                                    | v6.4.0 |
| ۵۵  | Dark mode fixes (8 فایل مالی/ابزار)                   | v6.4.0 |
| ۵۶  | Admin dashboard improvements                          | v6.4.0 |
| ۵۷  | 33 مقاله بلاگ SEO                                     | v6.4.0 |

### باقی‌مانده 📋 (منتظر سرویس خارجی)

| آیتم               | وضعیت                   |
| ------------------ | ----------------------- |
| درگاه پرداخت واقعی | 🕐 منتظر تأیید زرین‌پال |
| Google AdSense     | 🕐 منتظر تأیید گوگل     |
| Redis + CDN        | 📋 P2 بلندمدت           |
| Push notifications | 📋 نیاز به FCM/VAPID    |

---

## 🔧 ساختار پروژه

```
persiantoolbox/
├── app/                          # Next.js App Router
│   ├── (tools)/                  # صفحات ابزارها
│   ├── admin/                    # پنل ادمین
│   ├── api/                      # API routes
│   ├── blog/                     # بلاگ
│   ├── compare/                  # مقایسه ابزارها
│   ├── history/                  # تاریخچه + اشتراک‌گذاری
│   ├── text-tools/               # ابزارهای متنی جدید
│   └── use-cases/                # کاربردها
├── components/
│   ├── features/                 # کامپوننت‌های feature-specific
│   │   ├── blog/                 # BlogCard, BlogList, BlogPost, BlogSidebar
│   │   ├── finance/              # ابزارهای مالی
│   │   ├── salary/               # محاسبه حقوق
│   │   ├── text-tools/           # ResumeBuilder, SignatureTool
│   │   └── image-tools/          # ابزارهای تصویر
│   └── ui/                       # کامپوننت‌های مشترک
│       ├── AdminSidebar.tsx
│       ├── Breadcrumbs.tsx
│       ├── Navigation.tsx
│       ├── ToolPageShell.tsx
│       └── ...
├── content/blog/                 # مقالات بلاگ (Markdown)
├── data/salary-laws/             # داده‌های قوانین حقوق
├── features/salary/              # لاگیک محاسبه حقوق
├── lib/
│   ├── blog.ts                   # خواندن و پردازش بلاگ
│   ├── features/availability.ts  # فلگ‌های ویژگی
│   ├── server/                   # auth, adminAuth, db, users
│   ├── seo.ts                    # Metadata + JSON-LD helpers
│   └── tools-registry.ts         # رجیستری ابزارها
├── shared/ui/
│   ├── charts/                   # BarChart, LineChart, PieChart, Sparkline
│   ├── Button.tsx, Card.tsx, etc.
│   └── ...
├── tests/
│   ├── unit/                     # Vitest tests (421 tests)
│   └── e2e/                      # Playwright tests (43 tests)
├── docs/
│   └── roadmap.md                # نقشه راه
├── deploy-vps-auto.sh            # اسکریپت دیپلوی
└── package.json
```

---

## 🎯 قوانین توسعه

1. **هر ابزار جدید باید کامل و واقعی باشد** — بدون stub یا placeholder
2. **typecheck + lint + test قبل از هر deploy** — بدون استثنا
3. **RTL و Dark Mode** — در تمام کامپوننت‌ها
4. **پردازش محلی** — تمام ابزارها در مرورگر کار کنند
5. **SEO first** — هر صفحه metadata, OG, JSON-LD داشته باشد
6. **Mobile first** — تمام UI واکنش‌گرا باشد
7. **فارسی‌اول** — تمام متن‌های کاربر فارسی باشند
8. **Signed-off-by** — هر کامیت شامل DCO trailer

---

## 💰 درآمدزایی — وضعیت

| آیتم               | وضعیت                     |
| ------------------ | ------------------------- |
| درگاه پرداخت واقعی | 🕐 منتظر تأیید زرین‌پال   |
| Plan پریمیوم       | ✅ آماده (API + UI موجود) |
| تبلیغات AdSense    | 🕐 منتظر تأیید گوگل       |
| API پولی           | 📋 برنامه‌ریزی شده        |

---

## 📝 نکات مهم برای سشن‌های آینده

- **هر بار که سشن جدید شروع می‌شود**: فقط بگو "برنامه رشد رو شروع کن"
- **AGENTS.md رو بخون** — نقشه راه و وضعیت فعلی اینجاست
- **docs/roadmap.md** — نقشه راه کامل با اولویت‌بندی
- **package.json** — نسخه فعلی رو چک کن
- **VPS deploy**: `bash deploy-vps-auto.sh`
- **Health check**: `curl https://persiantoolbox.ir/api/health`
- **Git remote**: `origin` → `https://github.com/alirezasafaei-dev/persiantoolbox.git`
