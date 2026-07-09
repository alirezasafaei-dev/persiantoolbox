# مستند ارتقای بلاگ PersianToolbox به سطح Medium / dev.to

## هدف

تبدیل بلاگ PersianToolbox از یک آرشیو مقاله به یک مجله محصول‌محور، سئو‌فرندلی و تصویرمحور؛ با تجربه خواندن حرفه‌ای، اسکرین‌شات واقعی ابزارها، مسیرهای محتوایی، اعتمادسازی و CTAهای طبیعی به ابزارها.

## وضعیت فعلی ریپو

ساختار فعلی بلاگ پایه خوبی دارد:

- مقاله‌ها در `content/blog` نگهداری می‌شوند.
- خواندن و پردازش مقاله‌ها در `lib/blog.ts` انجام می‌شود.
- صفحه مقاله در `app/blog/[slug]/page.tsx` ساخته می‌شود.
- کامپوننت اصلی نمایش مقاله `components/features/blog/BlogPost.tsx` است.
- کارت مقاله `components/features/blog/BlogCard.tsx` است.
- لیست بلاگ `components/features/blog/BlogListClient.tsx` است.
- بخش بلاگ صفحه اصلی `components/home/BlogPreviewSection.tsx` است.
- اسکیمای مقاله در `components/seo/BlogPostSchema.tsx` قرار دارد.
- تصویر OG داینامیک در `app/blog/[slug]/opengraph-image.tsx` تولید می‌شود.
- RSS در `app/feed.xml/route.ts` وجود دارد.

نقطه ضعف اصلی فعلی این است که بلاگ هنوز visual/product-led نیست؛ یعنی تصویر شاخص، اسکرین‌شات واقعی، تجربه editorial، هاب‌های موضوعی و author/trust layer به اندازه کافی جدی نشده‌اند.

## جهت محصولی پیشنهادی

PersianToolbox نباید Medium یا dev.to را صرفاً کپی کند. نسخه درست برای این پروژه:

> Medium-like reading experience + dev.to-like practical workflow + product documentation clarity

یعنی مقاله‌ها باید خوش‌خوان باشند، کاربردی باشند، ابزار واقعی را نشان دهند، با اسکرین‌شات و مثال پیش بروند، و کاربر را به استفاده از ابزار برسانند.

## اصل مهم: اسکرین‌شات واقعی، نه عکس استوک

برای سایت ابزارمحور، عکس استوک ارزش محدودی دارد. تصویر باید محصول را نشان دهد:

- فرم ورودی ابزار
- خروجی ابزار
- جدول نتیجه
- workflow چندمرحله‌ای
- نمونه خروجی PDF/رزومه/فاکتور/محاسبه

هر مقاله مهم باید حداقل این ساختار بصری را داشته باشد:

1. تصویر شاخص برنددار
2. اسکرین‌شات واقعی از فرم یا شروع ابزار
3. اسکرین‌شات خروجی ابزار
4. تصویر workflow یا چک‌لیست
5. جدول یا نمودار قابل اسکن

## فاز ۱ — Blog Visual System

### ۱. توسعه metadata مقاله

در `lib/blog.ts` فیلدهای اختیاری زیر اضافه شوند:

```ts
coverAlt?: string;
imageCaption?: string;
reviewedBy?: string | null;
reviewedDate?: string | null;
```

رفتار باید backward-compatible باشد. مقاله‌های قدیمی بدون این فیلدها نباید خراب شوند.

نمونه frontmatter:

```yaml
coverImage: '/images/blog/loan-calculation/cover.webp'
coverAlt: 'نمونه محاسبه اقساط وام در جعبه ابزار فارسی'
imageCaption: 'نمایی از ابزار محاسبه اقساط وام با داده‌های نمونه'
```

### ۲. نمایش cover image در کارت مقاله

در `components/features/blog/BlogCard.tsx`:

- اگر `post.coverImage` وجود داشت، تصویر با `next/image` نمایش داده شود.
- `alt` از `post.coverAlt || post.title` بیاید.
- اگر تصویر نبود، fallback فعلی gradient/icon حفظ شود.
- کارت نباید layout shift شدید داشته باشد.
- نسبت تصویر پیشنهادی: 16:9 یا 1200x630.

### ۳. نمایش hero image در صفحه مقاله

در `components/features/blog/BlogPost.tsx`:

- بعد از header مقاله و قبل از series/content تصویر hero نمایش داده شود.
- اگر `imageCaption` وجود داشت زیر تصویر نمایش داده شود.
- استایل پیشنهادی: rounded corners، border subtle، shadow subtle، responsive.
- اگر coverImage وجود ندارد، هیچ فضای خالی اضافه نشود.

### ۴. نمایش thumbnail در صفحه اصلی و list mode

در این فایل‌ها:

- `components/home/BlogPreviewSection.tsx`
- `components/features/blog/BlogListClient.tsx`

برای پست‌های دارای `coverImage` thumbnail نمایش داده شود؛ برای بقیه fallback سبک حفظ شود.

### ۵. استایل تصاویر داخل Markdown

چون مقاله‌ها از Markdown به HTML تبدیل می‌شوند، در `.prose` مقاله تصاویر باید این استایل‌ها را بگیرند:

- `max-width: 100%`
- rounded
- border
- subtle shadow
- margin top/bottom
- no mobile overflow
- کپشن بعد از تصویر خوانا باشد

فعلاً تبدیل همه تصاویر Markdown به `next/image` را فاز بعدی نگه دارید مگر پیاده‌سازی کم‌ریسک باشد.

## فاز ۲ — استاندارد فایل‌های تصویری بلاگ

مستند جداگانه در مسیر زیر ساخته شود:

`docs/content/blog-image-guidelines.md`

محتوای لازم:

```txt
public/images/blog/<article-slug>/
  cover.webp
  step-1.webp
  step-2.webp
  result.webp
  checklist.webp
```

ابعاد پیشنهادی:

- cover: `1200x630`
- screenshot: عرض حداکثر `1400px`
- workflow/checklist: حدود `1200x800`

فرمت:

- ترجیحاً `.webp`
- در صورت نیاز `.avif`

حجم هدف:

- cover کمتر از ۱۸۰KB
- screenshot کمتر از ۲۵۰KB

قوانین اسکرین‌شات:

- از UI واقعی PersianToolbox گرفته شود.
- فقط داده فرضی استفاده شود.
- هیچ شماره موبایل، کد ملی، شماره کارت، آدرس، نام واقعی یا داده شخصی در تصویر نباشد.
- برای ابزارهای مالی/قراردادی از سناریوهای فرضی استفاده شود.
- اگر داده حساس دیده می‌شود blur شود.
- از یک عرض ثابت مرورگر برای یکدستی تصاویر استفاده شود.
- از تم واقعی سایت استفاده شود.

## فاز ۳ — ارتقای صفحه اصلی بلاگ

صفحه `/blog` باید از حالت آرشیو ساده به صفحه editorial تبدیل شود:

1. Hero بلاگ
2. Featured article بزرگ با تصویر
3. ۳ مقاله منتخب
4. هاب‌های موضوعی
5. جدیدترین مقاله‌ها
6. سری‌های آموزشی
7. ابزارهای مرتبط با مقالات
8. CTA خبرنامه/تلگرام

قابلیت‌های فعلی مثل search، sort، grid/list، pagination، category filter و RSS حفظ شوند.

## فاز ۴ — هاب‌های موضوعی

هاب‌های پیشنهادی:

- `/blog/finance`
- `/blog/pdf`
- `/blog/writing`
- `/blog/contracts`
- `/blog/career`
- `/blog/privacy`

هر هاب شامل توضیح کوتاه، مسیر یادگیری پیشنهادی، ابزارهای مرتبط، مقاله pillar، مقالات تازه، سوالات رایج کاربر و CTA به ابزارهای همان حوزه باشد.

## فاز ۵ — مقاله‌های Pillar

اول فقط ۸ مقاله خیلی خوب:

1. راهنمای کامل محاسبه اقساط وام
2. راهنمای کامل حقوق ۱۴۰۵
3. فاکتور برای فریلنسرها و کسب‌وکارهای کوچک
4. نیم‌فاصله و پاک‌سازی متن فارسی
5. کاهش حجم PDF و مدیریت اسناد
6. رزومه حرفه‌ای برای بازار کار ایران
7. پردازش محلی و امنیت فایل
8. چک‌لیست عمومی قرارداد اجاره قبل از ثبت نهایی

هر مقاله باید ۲۰۰۰ تا ۳۵۰۰ کلمه، یک تصویر شاخص، ۳ تا ۵ اسکرین‌شات واقعی، مثال واقعی با داده فرضی، جدول یا فرمول، چک‌لیست، CTA به ابزار اصلی، لینک داخلی، تاریخ بروزرسانی و هشدار محدودیت برای موضوعات مالی/حقوقی داشته باشد.

## فاز ۶ — لایه اعتماد و نویسنده

لازم است اضافه شود:

- صفحه نویسنده
- بیوی کوتاه نویسنده زیر مقاله
- `reviewedBy` برای مقاله‌های حساس
- تاریخ آخرین بروزرسانی قابل نمایش
- بخش منابع/محدودیت‌ها در مقاله‌های مالی و حقوقی

## فاز ۷ — SEO و Schema

در `BlogPostSchema.tsx`:

- در صورت سازگاری از `BlogPosting` استفاده شود.
- `image` از `coverImage` بیاید.
- `datePublished` و `dateModified` حفظ شود.
- `author`، `publisher`، `wordCount`، `keywords` و `articleSection` حفظ شوند.
- `publisher.url` و در صورت وجود `author.url` اضافه شود.
- از fake rating/review schema استفاده نشود.

## اصلاح CTA ابزارها

در `components/features/blog/BlogToolCTA.tsx` مسیرهای قدیمی بررسی شوند. نمونه مورد مشکوک: مسیر رزومه نباید به مسیر قدیمی برود اگر مسیر واقعی `/career-tools/resume-builder` است.

## Definition of Done

این تسک وقتی کامل است که:

- مقاله‌های قدیمی بدون تصویر هنوز درست نمایش داده شوند.
- مقاله دارای coverImage در card، homepage، list و article page درست نمایش داده شود.
- تصاویر داخل Markdown در موبایل overflow ندهند.
- schema معتبر باشد.
- RSS خراب نشود.
- lint/typecheck/build پاس شود.
- مستندات تصویر بلاگ اضافه شده باشد.
- یک مقاله draft نمونه با screenshot placeholders اضافه شده باشد.

## ترتیب پیشنهادی اجرا

1. metadata fields
2. BlogCard cover
3. BlogPost hero
4. Markdown screenshot styles
5. Homepage/list thumbnails
6. Blog image guidelines
7. BlogToolCTA route cleanup
8. Sample visual article draft
9. Editorial blog homepage
10. Topic hubs
11. Pillar article rewrites
