# پرامپت اجرای ایجنت واقعی برای ارتقای بلاگ PersianToolbox

تو داخل ریپوی PersianToolbox کار می‌کنی. هدف این تسک ارتقای بلاگ به سطح یک تجربه حرفه‌ای شبیه Medium/dev.to است، اما با هویت محصولی PersianToolbox: مقاله‌های عمیق، سئو‌فرندلی، تصویرمحور، ابزارمحور و قابل اعتماد.

مهم: هدف استفاده از عکس استوک نیست. هدف استفاده از اسکرین‌شات واقعی ابزارهای PersianToolbox داخل مقالات است.

## مرحله صفر: بررسی ریپو

قبل از تغییر، این فایل‌ها را بررسی کن:

- `content/blog`
- `lib/blog.ts`
- `app/blog/[slug]/page.tsx`
- `components/features/blog/BlogPost.tsx`
- `components/features/blog/BlogCard.tsx`
- `components/features/blog/BlogListClient.tsx`
- `components/home/BlogPreviewSection.tsx`
- `components/seo/BlogPostSchema.tsx`
- `components/features/blog/BlogToolCTA.tsx`
- `app/blog/[slug]/opengraph-image.tsx`
- `app/feed.xml/route.ts`
- `next.config.mjs`
- `package.json`

بعد از بررسی، تغییرات را کوچک و قابل review انجام بده.

## هدف فاز اول

یک Blog Visual System بساز که:

1. تصویر شاخص مقاله را پشتیبانی کند.
2. تصویر شاخص را در کارت، صفحه مقاله، صفحه اصلی و list view نمایش دهد.
3. اسکرین‌شات‌های داخل Markdown را زیبا و responsive نمایش دهد.
4. مستندات کامل برای نویسنده محتوا ایجاد کند.
5. مسیر CTA ابزارها را اصلاح کند.
6. یک مقاله draft نمونه با placeholder مسیرهای اسکرین‌شات واقعی اضافه کند.

## تسک ۱: توسعه مدل داده مقاله

در `lib/blog.ts` فیلدهای اختیاری زیر را به `BlogPost` و `BlogPostMeta` اضافه کن، اگر وجود ندارند:

```ts
coverAlt?: string;
imageCaption?: string;
reviewedBy?: string | null;
reviewedDate?: string | null;
```

در `getPostBySlug` این فیلدها را از frontmatter بخوان:

```yaml
coverImage: '/images/blog/loan-calculation/cover.webp'
coverAlt: 'نمونه محاسبه اقساط وام در جعبه ابزار فارسی'
imageCaption: 'نمایی از ابزار محاسبه اقساط وام با داده‌های نمونه'
reviewedBy: null
reviewedDate: null
```

در `getAllPosts` هم این فیلدها را برای meta برگردان.

قانون: مقاله‌های قدیمی بدون این فیلدها نباید خراب شوند.

## تسک ۲: نمایش cover image در BlogCard

در `components/features/blog/BlogCard.tsx`:

- `next/image` را import کن.
- اگر `post.coverImage` وجود دارد، تصویر را در بخش بالای کارت نمایش بده.
- alt برابر `post.coverAlt || post.title` باشد.
- تصویر object-cover باشد.
- نسبت تصویر کارت ثابت بماند.
- اگر coverImage وجود ندارد، fallback فعلی gradient/icon را نگه دار.

## تسک ۳: نمایش hero image در صفحه مقاله

در `components/features/blog/BlogPost.tsx`:

- بعد از header و قبل از `BlogSeries`/content، اگر `post.coverImage` وجود دارد، تصویر hero نمایش بده.
- از `next/image` استفاده کن.
- alt برابر `post.coverAlt || post.title` باشد.
- اگر `post.imageCaption` وجود دارد زیر تصویر کپشن ظریف نمایش بده.
- در موبایل تصویر نباید overflow بدهد.
- اگر coverImage وجود ندارد، هیچ فضای خالی اضافه نشود.

## تسک ۴: نمایش thumbnail در صفحه اصلی و list view

در `components/home/BlogPreviewSection.tsx`:

- اگر پست coverImage دارد، بالای کارت thumbnail نمایش بده.
- اگر ندارد، رفتار فعلی یا fallback سبک حفظ شود.

در `components/features/blog/BlogListClient.tsx`:

- در حالت list view، thumbnail کوچک برای پست دارای coverImage نمایش بده.
- اگر تصویر ندارد، list view فعلی حفظ شود یا placeholder سبک داشته باشد.

## تسک ۵: استایل تصاویر داخل Markdown

در `components/features/blog/BlogPost.tsx` یا استایل مربوط به prose، برای تصاویر داخل `.prose` این استایل‌ها را اضافه کن:

- max-width: 100%
- height auto
- border radius
- border subtle
- subtle shadow
- margin top/bottom
- background مناسب
- no horizontal overflow on mobile

برای کپشن‌ها، اگر کپشن به شکل پاراگراف italic بعد از تصویر آمده بود، ظاهری شبیه caption بده.

اگر تبدیل Markdown images به `next/image` تغییر زیادی لازم دارد، فعلاً انجام نده. فقط استایل را حرفه‌ای کن و در گزارش بنویس که تبدیل به next/image فاز بعدی است.

## تسک ۶: بهبود BlogPostSchema

در `components/seo/BlogPostSchema.tsx`:

- اگر سازگار است `@type` را از `Article` به `BlogPosting` تغییر بده.
- `image` را از `coverImage` بگیر و fallback را حفظ کن.
- `datePublished`, `dateModified`, `author`, `publisher`, `url`, `articleSection`, `wordCount`, `keywords` را نگه دار.
- `publisher.url` را اضافه کن.
- اگر author URL در آینده وجود نداشت، مقدار جعلی نساز.
- هیچ rating/review schema جعلی اضافه نکن.

## تسک ۷: مستندات تصویر بلاگ

فایل زیر را بساز:

`docs/content/blog-image-guidelines.md`

داخلش بنویس:

- هدف استفاده از اسکرین‌شات واقعی
- مسیر ذخیره تصاویر:

```txt
public/images/blog/<article-slug>/
  cover.webp
  step-1.webp
  step-2.webp
  result.webp
  checklist.webp
```

- ابعاد پیشنهادی: cover برابر 1200x630، screenshot با عرض حداکثر 1400px، workflow حدود 1200x800
- فرمت: webp یا avif
- حجم هدف: cover زیر 180KB و screenshot زیر 250KB
- قوانین: داده واقعی کاربر ممنوع، اطلاعات حساس حذف یا blur شود، داده‌ها sample/fake باشند، اسکرین‌شات از UI واقعی PersianToolbox باشد، alt فارسی طبیعی نوشته شود، keyword stuffing ممنوع
- مثال frontmatter کامل
- مثال Markdown image با caption

## تسک ۸: اصلاح CTA ابزارها

در `components/features/blog/BlogToolCTA.tsx` مسیرهای ابزارها را با routeهای واقعی ریپو تطبیق بده.

به‌خصوص بررسی کن:

- رزومه باید به مسیر درست مثل `/career-tools/resume-builder` برود، نه مسیر قدیمی.
- PDF tools مسیرهای واقعی داشته باشند.
- OCR، تاریخ، مالیات، بیمه و ابزارهای مالی را با registry بررسی کن.

تغییرات باید کم‌ریسک و محدود باشند.

## تسک ۹: ساخت مقاله draft نمونه

یک مقاله draft نمونه بساز:

`content/blog/2026-07-xx-loan-calculation-visual-guide.md`

ویژگی‌ها:

- `published: false`
- frontmatter کامل با `coverImage`, `coverAlt`, `imageCaption`
- مسیرهای تصویر placeholder مطابق استاندارد
- محتوای سئو‌فرندلی، اما کوتاه‌تر از مقاله نهایی
- CTA به `/loan`
- لینک داخلی به ابزارهای مرتبط موجود
- هشدار اینکه خروجی ابزار برای برآورد است
- TODO واضح برای گرفتن اسکرین‌شات‌های واقعی

مقاله نباید ادعای مالی قطعی داشته باشد.

## تسک ۱۰: تست

بعد از تغییرات، اسکریپت‌ها را از `package.json` بررسی کن و اجرا کن:

- lint
- typecheck اگر وجود دارد
- test اگر وجود دارد
- build اگر منابع اجازه می‌دهد

اگر اسکریپتی وجود ندارد، در گزارش ذکر کن.

## کنترل کیفیت دستی

بررسی کن:

- مقاله قدیمی بدون coverImage درست نمایش داده می‌شود.
- مقاله جدید با coverImage درست نمایش داده می‌شود.
- کارت بلاگ، صفحه بلاگ، صفحه اصلی و صفحه مقاله درست هستند.
- تصاویر inline در موبایل overflow ندارند.
- JSON-LD خطای obvious ندارد.
- RSS خراب نشده است.
- مسیرهای CTA ابزارها درست هستند.
- هیچ داده حساس یا واقعی در مقاله نمونه نیست.

## خروجی نهایی ایجنت

در پایان گزارش بده:

1. چه فایل‌هایی تغییر کردند.
2. چه تصمیم‌های فنی گرفته شد.
3. چه تست‌هایی اجرا شد و نتیجه چه بود.
4. چه چیزهایی باقی مانده است.
5. دستورالعمل کوتاه برای نویسنده محتوا.

## قوانین مهم

- تغییرات را کوچک و قابل review نگه دار.
- dependency جدید اضافه نکن مگر واقعاً لازم باشد.
- عکس استوک اضافه نکن.
- داده واقعی کاربر در اسکرین‌شات ممنوع است.
- مقاله‌های مالی/حقوقی حساس را `published: false` نگه دار.
- اگر مطمئن نیستی، TODO بگذار و گزارش بده.
