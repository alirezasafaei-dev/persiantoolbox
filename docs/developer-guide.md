# راهنمای توسعه‌دهنده (Developer Guide)

> آخرین به‌روزرسانی: 2026-02-06

این سند برای توسعه قابلیت جدید در Persian Tools است. هدف این است که هر تغییر جدید با اصول Local-first، RTL-first، دسترس‌پذیری و حریم خصوصی هم‌راستا باشد.

## ساختار پیشنهادی برای ابزار جدید

1. مسیر صفحه: `app/<category>/<tool>/page.tsx`
2. منطق ویژگی: `features/<category>/<tool>/`
3. ابزار مشترک قابل استفاده مجدد: `shared/`
4. UI مشترک: `components/` یا `shared/ui/`

## چک‌لیست طراحی و UI

- از توکن‌های `shared/constants/tokens.ts` استفاده کنید.
- از خصوصیت‌ها و کلاس‌های منطقی RTL (`start/end`, `ms/me`) استفاده کنید.
- `left/right` را فقط در شرایط استثنایی و مستندشده استفاده کنید.
- حالت‌های `loading`, `empty`, `error` را برای هر فرم/ابزار مشخص کنید.
- انیمیشن‌ها باید `prefers-reduced-motion` را رعایت کنند.

## چک‌لیست دسترس‌پذیری

- برای ورودی‌ها label معتبر و `aria-*` لازم را اضافه کنید.
- برای عملیات async از stateهایی مثل `aria-busy` و اعلان وضعیت استفاده کنید.
- ناوبری کامل با کیبورد در مسیر اصلی ابزار ممکن باشد.
- کنتراست رنگ باید حداقل WCAG 2.1 AA را پوشش دهد.

## چک‌لیست حریم خصوصی و امنیت

- پردازش داده باید local-first بماند مگر با رضایت صریح.
- هیچ اسکریپت runtime خارجی به هسته ابزار اضافه نکنید.
- برای JSON-LD از جریان nonce (`proxy.ts` + `next/script`) استفاده کنید.
- هر قابلیت تبلیغات/تحلیل‌گر باید پشت consent روشن کاربر باشد.

## چک‌لیست PWA و آفلاین

- مسیرهای کلیدی ابزار باید در سناریوی آفلاین قابل fallback باشند.
- اگر استراتژی کش تغییر کرد، `CACHE_VERSION` در `public/sw.js` افزایش یابد.
- در تغییرات مرتبط با SW/Offline، تست E2E مرتبط را اجرا یا به‌روزرسانی کنید.

## الگوی تست واقعی

```bash
# baseline
pnpm ci:quick
pnpm ci:contracts

# در تغییرات حیاتی مسیرهای کاربری
pnpm test:e2e:ci
```

- برای منطق‌های business-critical تست واحد اضافه کنید.
- برای Workerها از mock و سناریوهای `progress/result/error` استفاده کنید.
- داده تست باید کوچک، غیرحساس و deterministic باشد.

## MCP برای سرعت توسعه

ترتیب پیشنهادی برای آماده‌سازی MCP در محیط توسعه:

1. نصب وابستگی‌ها:

```bash
pnpm install
```

2. تنظیم متغیرهای لازم:

```bash
export DATABASE_URL="postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools"
# اختیاری برای عملیات خصوصی GitHub
export GITHUB_PERSONAL_ACCESS_TOKEN="<token>"
```

3. اجرای smoke-check سرورهای MCP:

```bash
./scripts/mcp-start.sh
```

4. استفاده در کلاینت:

- سرورها در `mcp-config.toml` تعریف شده‌اند.
- MCPهای stdio روی demand توسط کلاینت اجرا می‌شوند و نیاز به daemon جداگانه ندارند.

## اجرای سنگین (Codex Cloud)

- برای jobهای خیلی سنگین/زمان‌بر از محیط آماده استفاده کنید:
  - `https://chatgpt.com/codex/settings/environment/698658924bb081919cd3731a5cd5498f`
- پنل مدیریت Codex:
  - `https://chatgpt.com/codex`

## حداقل مدارک لازم در PR

1. شرح مساله و دلیل تغییر
2. اولویت و ترتیب اجرای تغییر (بدون زمان‌بندی این هفته/کوتاه‌مدت/بلندمدت)
3. فهرست فایل‌های اصلی تغییر
4. خروجی تست‌های اجراشده
5. اگر رفتار تغییر کرده، به‌روزرسانی مستندات در `docs/`

## منابع مرجع

- `docs/project-standards.md`
- `docs/operations.md`
- `docs/roadmap.md`
- `CONTRIBUTING.md`
