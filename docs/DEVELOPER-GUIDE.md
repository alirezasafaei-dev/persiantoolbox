# راهنمای توسعه‌دهندگان - PersianToolbox

## شروع سریع

### پیش‌نیازها

- Node.js 20+
- pnpm 10+

### نصب

```bash
pnpm install
```

### توسعه

```bash
pnpm dev
```

### بیلد

```bash
pnpm build
```

### تست

```bash
pnpm test
pnpm lint
pnpm typecheck
```

## ساختار پروژه

```
app/                    # صفحات Next.js App Router
  (tools)/              # صفحات ابزارها
  api/                  # API endpoints
  favorites/            # صفحه علاقه‌مندی‌ها
  history/              # صفحه تاریخچه
components/             # کامپوننت‌های React
  features/             # کامپوننت‌های ابزارها
  ui/                   # کامپوننت‌های عمومی
features/               # منطق ابزارها
  pdf-tools/            # ابزارهای PDF
  image-tools/          # ابزارهای تصویر
  finance/              # ابزارهای مالی
lib/                    # ماژول‌های کمکی
  features/             # فیچر فلگ‌ها
  seo.js                # ابزارهای SEO
shared/                 # ماژول‌های مشترک
public/                 # فایل‌های استاتیک
```

## اضافه کردن ابزار جدید

### ۱. ایجاد کامپوننت

```tsx
// components/features/new-tool/NewTool.tsx
'use client';
export default function NewTool() {
  return <div>New Tool</div>;
}
```

### ۲. ایجاد صفحه

```tsx
// app/(tools)/tools/new-tool/page.tsx
import NewTool from '@/components/features/new-tool/NewTool';
export const metadata = { title: 'ابزار جدید' };
export default function NewToolPage() {
  return <NewTool />;
}
```

### ۳. افزودن به registry

```ts
// lib/tools-registry.ts
{
  id: 'new-tool',
  path: '/tools/new-tool',
  title: 'ابزار جدید - جعبه ابزار فارسی',
  description: 'توضیحات ابزار',
  keywords: ['keyword1', 'keyword2'],
  indexable: true,
  lastModified: '2026-06-17',
  kind: 'tool',
  category: categoryOrThrow('finance'), // or 'pdf', 'image', 'date', 'text', 'validation'
}
```

## فیچر فلگ‌ها

### فعال‌سازی در .env.production

```bash
FEATURE_AUTH_ENABLED=1
FEATURE_DASHBOARD_ENABLED=1
FEATURE_HISTORY_ENABLED=1
```

### استفاده در کد

```ts
import { isFeatureEnabled } from '@/lib/features/availability';
if (isFeatureEnabled('auth')) {
  // اجرای کد auth
}
```

## تست‌ها

### تست‌های واحد

```bash
pnpm test
```

### تست‌های E2E

```bash
pnpm test:e2e
```

### لینت

```bash
pnpm lint
```

### تایپ‌چک

```bash
pnpm typecheck
```

## دیپلوی

### دستی

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ user@server:/var/www/persiantoolbox/
ssh user@server "cd /var/www/persiantoolbox && pnpm install && pnpm build"
```

### PM2

```bash
pm2 restart persiantoolbox
pm2 save
```

## مشکل‌یابی

### خطای build

```bash
rm -rf .next && pnpm install && pnpm build
```

### خطای lint

```bash
pnpm lint --fix
```

### خطای type

```bash
pnpm typecheck
```
