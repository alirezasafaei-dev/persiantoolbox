# PTB-SEO-001 — سیاست SEO (Metadata, URL, Schema, Indexing)

## هدف
هر ابزار باید یک صفحه قابل ایندکس، با محتوای کافی و اسکیما معتبر داشته باشد.

## 1) URL Strategy
### باید (MUST)
- URL کوتاه، پایدار، و بدون تکرار بی‌مورد کلمات
- مسیر ابزارها زیر `/tools/<slug>` یا گروه‌های مشخص (`/pdf/...`, `/date/...`) با ریدایرکت ثابت
- تغییر URL فقط با redirect دائمی

### ضدالگو (DON'T)
- تکرار کلمه کلیدی در URL در چند سطح
- داشتن مسیرهای متعدد برای یک ابزار بدون canonical صحیح

## 2) Metadata Policy
- `title` و `description` باید یکتا باشد.
- canonical باید دقیق و پایدار باشد.
- OG image باید PNG 1200×630 داشته باشد (SVG فقط به عنوان fallback مجاز نیست).

## 3) Indexing Policy
- ابزارهای Coming‑Soon نباید index شوند.
- صفحات بدون ارزش محتوایی (placeholder) باید `noindex` باشند.

## 4) Schema Policy
- Tool pages: `SoftwareApplication` یا `WebApplication`
- Category/Hub pages: `ItemList`
- FAQ sections: `FAQPage`
- Breadcrumb: `BreadcrumbList`

## معیار پذیرش
- هیچ صفحه Coming‑Soon در sitemap نباشد.
- Metadata و اسکیما در تست‌های Rich Results خطا ندهد.
