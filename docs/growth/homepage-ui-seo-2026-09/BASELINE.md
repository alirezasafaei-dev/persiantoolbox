# Baseline — 2026-09-20

## روش و حدود
بازدید مرورگر از صفحه اصلی در دسکتاپ، خواندن DOM زنده، درخواست HTTP و مطالعه GitHub. تست موبایل، Lighthouse و داده خصوصی GSC در این بررسی اجرا/دریافت نشده‌اند.
نسخه مبنای مخزن و پاسخ زنده /api/version هر دو: `7b743046b9f3d652ecfc2d2f2a64274550e2e21f`؛ نسخه 8.0.0، builtAt برابر 2026-09-18T22:03:01Z.
این مشاهده تاریخ‌دار است؛ مجری باید هنگام شروع HEAD و نسخه زنده را دوباره ثبت کند.

## یافته‌های تأییدشده
- HomeHero.tsx: سه trust pill داخل lg:grid-cols-6؛ گروه در دسکتاپ از مرکز خارج است.
- هیرو متن‌محور و کارت‌ها عمدتاً هم‌شکل و کم‌رنگ؛ جهت پیشنهادی یک قضاوت طراحی است، نه امتیاز علمی.
- چند بخش انتخاب ابزار محتوای مشابه دارند؛ اثبات جریمه سئو نیست.
- دعوت نصب و پیام کوکی در مرورگر هم‌زمان بخشی از محتوا را پوشاندند.
- DOM شامل دو Organization و دو WebSite بود؛ sameAs در HomePage به parsairaniiidev/persiantoolbox و layout به alirezasafaeigfx/persiantoolbox اشاره می‌کند.
- FAQ، شرح عمومی SEO و پیام کوکی ادعای مطلق پردازش محلی دارند؛ هیرو و /trust محتاطانه‌ترند.
- /، /robots.txt و /sitemap.xml پاسخ 200 داشتند.
- sitemap دارای 482 URL یکتا، بدون دامنه خارجی یا lastmod آینده در داده بررسی‌شده بود؛ صحت همه URLها آزموده نشده است.
- /loan، /salary، /trust، /date-tools، /pdf-tools و /business-tools/document-studio پاسخ 200، یک H1، canonical خودارجاع و index,follow داشتند.
- صفحه اصلی یک H1 و canonical دامنه اصلی داشت.
- HTML خام صفحه اصلی در یک دریافت 335888 بایت بود؛ این اندازه انتقال فشرده یا شاخص CWV نیست.
- /fonts/ در robots مسدود است؛ نیاز به بررسی رندر دارد، نه تغییر بدون شاهد.

## محدودیت GSC
GSC Wizard در list_sites خطای payment_required داد؛ Performance، ایندکس، URL Inspection و CWV حساب دریافت نشدند.
کد و گزارش‌های قدیمی GSC در ریپو، داده امروز نیستند. خرید سرویس لازم نیست؛ از یک اتصال مجاز موجود یا export مالک استفاده شود. هیچ token یا داده خصوصی query وارد ریپوی عمومی نشود.

## منابع
- https://persiantoolbox.ir/
- https://persiantoolbox.ir/api/version
- https://persiantoolbox.ir/robots.txt
- https://persiantoolbox.ir/sitemap.xml
- https://github.com/alirezasafaeigfx/persiantoolbox
- https://developers.google.com/search/docs/appearance/ai-features
- گزارش همراه: https://app.notion.com/p/3e1199a139068191a02de63f1924c2c9?pvs=204

راهنمای گوگل برای AI Overviews و AI Mode فایل یا schema ویژه الزامی نمی‌داند. این گفته تضمین ارجاع و قابل تعمیم قطعی به همه موتورهای پاسخ‌گو نیست.
