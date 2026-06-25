# سیستم درآمدزایی PersianToolbox

## نقش در شبکه درآمدی

PersianToolbox نقش **موتور ترافیک** در قیف درآمدی سه‌لایه دارد.

## معماری یکپارچه

```
کاربر → PersianToolbox (ابزار رایگان) → Portfolio (اعتماد‌سازی) → تبدیل به مشتری
```

## سیستم CTA متقابل

### کامپوننت اصلی

**مسیر:** `shared/cross-site/PortfolioCTA.tsx`

**انواع CTA:**

1. **Footer CTA** - در فوتر همه صفحات

   ```tsx
   <PortfolioCTA variant="footer" />
   ```

2. **Tool Result CTA** - بعد از استفاده از ابزار

   ```tsx
   <PortfolioCTA variant="tool-result" toolId="pdf-merge" />
   ```

3. **Premium Gate CTA** - برای قابلیت‌های پریمیوم

   ```tsx
   <PortfolioCTA variant="premium-gate" toolId="batch-processing" />
   ```

4. **Sidebar CTA** - نوار کناری صفحات ابزار
   ```tsx
   <PortfolioCTA variant="sidebar" />
   ```

## ردیابی تحلیلی

همه CTAها به صورت خودکار در سیستم analytics ثبت می‌شوند:

```typescript
// هر کلیک CTA ثبت می‌شود
analytics.trackCTAClick(variant, 'portfolio', toolId);

// استفاده از ابزار ثبت می‌شود
analytics.trackToolUsage(toolId, action, metadata);
```

**API Endpoint:** `https://alirezasafaeisystems.ir/api/track`

## نقاط تبدیل

### 1. بازدید ابزار

- کاربر وارد صفحه ابزار می‌شود
- از ابزار استفاده می‌کند
- CTA در نتیجه ابزار می‌بیند

### 2. کلیک CTA

- کاربر روی CTA کلیک می‌کند
- به Portfolio هدایت می‌شود
- Session ID حفظ می‌شود

### 3. بازدید Portfolio

- کاربر نمونه کارها را می‌بیند
- اعتماد ایجاد می‌شود
- CTA برای تماس می‌بیند

### 4. تبدیل

- کاربر فرم تماس را پر می‌کند
- یا Audit رایگان درخواست می‌کند
- تبدیل به لید می‌شود

## استراتژی مونتیزاسیون (فاز 2)

### Freemium Model

**رایگان:**

- 5 عملیات در روز
- ویژگی‌های پایه
- واترمارک روی خروجی

**پریمیوم ($19/ماه):**

- عملیات نامحدود
- بدون واترمارک
- پردازش دسته‌ای
- ذخیره‌سازی ابری (50GB)
- دسترسی API

### محدودیت‌های ویژگی

**فایل:** `lib/gates/feature-gates.ts` (فاز 2)

```typescript
export const FEATURE_LIMITS = {
  'pdf-merge': { free: 5, premium: Infinity },
  'pdf-compress': { free: 3, premium: Infinity },
  'batch-processing': { free: false, premium: true },
  'watermark-removal': { free: false, premium: true },
  'cloud-storage': { free: false, premium: true },
  'api-access': { free: false, premium: true },
};
```

## معیارهای کلیدی

### ترافیک

- **هدف:** 10K-50K بازدید ماهانه
- **منبع:** SEO ارگانیک (کلمات کلیدی فارسی)

### تبدیل

- **Toolbox → Portfolio:** هدف 5-10% CTR
- **Portfolio → Contact:** هدف 20-30%
- **Contact → Paid:** هدف 50-70%

### درآمد (پیش‌بینی)

- **ماه 1-3:** $1K-5K (فریلنس)
- **ماه 4-6:** $5K-15K (فریلنس + SaaS)
- **ماه 7-12:** $15K-50K (مقیاس SaaS)

## مستندات تکمیلی

- [System Overview](../../docs/architecture/system-overview.md)
- [30-Day Roadmap](../../docs/roadmaps/30-day-mvp.md)
- [API Documentation](../../docs/api/analytics.md)

## راه‌اندازی محلی

```bash
# نصب وابستگی‌ها
pnpm install

# اجرای محلی
pnpm dev

# تست
pnpm typecheck
pnpm lint
pnpm test
```

## دیپلوی Production

```bash
# بیلد
pnpm build

# دیپلوی به VPS
# استفاده از اسکریپت‌های موجود در ops/
```

---

**آخرین بروزرسانی:** 2026-06-18
**نسخه:** 3.3.0
**وضعیت:** Production-ready (Week 1 of 30-day MVP)
