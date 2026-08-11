# نقشه راه اپ Android اسناد فارسی

**تاریخ مبنا:** 2026-08-11

**معماری:** `docs/technical/01-Architecture/04-android.md`

**اصل اجرا:** هر فاز باید یک خروجی قابل نمایش و gate قابل سنجش داشته باشد.

## تعریف موفقیت نسخه 1.0

کاربر روی یک گوشی میان‌رده می‌تواند بدون اینترنت و ثبت‌نام، سند چندصفحه‌ای را
اسکن کند، crop و فیلتر کند، PDF بسازد، متن فارسی را استخراج کند و خروجی را ذخیره
یا share کند. اپ روی API 26 تا 36 بدون data loss، crash و مجوز غیرضروری کار می‌کند.

## فاز 0 — آماده‌سازی محیط

**خروجی:** Windows 11، Android Studio، SDK، Git و Codex آماده و repository clone
شده است. OpenCode در WSL2 یک reviewer اختیاری است و نبود provider رایگان مانع فاز
نمی‌شود.

- اجرای کامل `docs/guides/android-windows-setup.md`.
- اجرای Mission
  `docs/android/agent-missions/phase-0-windows-bootstrap.md` و ثبت گزارش از روی
  template تعیین‌شده.
- اتصال یک گوشی واقعی با USB debugging و ساخت یک emulator.
- ثبت نتیجه فرمان‌های doctor بدون اطلاعات محرمانه.

**Gate:** `git`, `java`, `adb`, `sdkmanager` و `codex` قابل اجرا باشند؛ `adb devices`
حداقل یک target واقعی و مجاز نشان دهد. `opencode` یا باید قابل اجرا باشد یا با وضعیت
`blocked-optional` و علت محدودیت provider در گزارش ثبت شود.

## فاز 1 — foundation و spikeهای پرریسک

**خروجی:** یک اپ RTL خالی با CI سبز و گزارش تصمیم engineها.

- ساخت `android/`، convention pluginها، version catalog و `:apps:documents`.
- تنظیم `minSdk 26`، `compileSdk/targetSdk 36`، release shrinking و dependency lock.
- پیاده‌سازی interfaceهای `ImageProcessor`, `PdfEngine`, `OcrEngine` و fakeها.
- spike CameraX + OpenCV: capture، edge detection و perspective correction.
- spike PDF: create/merge/split/compress و R8 release روی fixtureهای واقعی.
- spike OCR: `fas+eng`، مصرف حافظه، زمان و حجم artifact.
- CI مستقل Android و گزارش license/SBOM.

**Gate:** release APK روی ARM64 نصب شود؛ تمام spike fixtureها pass شوند؛ engine
ناموفق جایگزین یا دامنه قابلیت پیش از ادامه اصلاح شود.

## فاز 2 — vertical slice اسکن تا PDF

**خروجی:** یک کاربر می‌تواند 1 تا 5 صفحه اسکن و PDF را export کند.

- home و ایجاد سند.
- CameraX preview، permission flow و capture.
- overlay تشخیص لبه + crop دستی.
- perspective correction و چهار filter.
- page strip، reorder، rotate و delete.
- PDF create، SAF save و Android share sheet.
- تست end-to-end این مسیر و process-death recovery.

**Gate:** مسیر اصلی روی دو دستگاه واقعی 20 بار بدون crash/data loss اجرا شود و
هیچ پردازشی روی main thread گزارش نشود.

## فاز 3 — کتابخانه اسناد و ابزارهای PDF

**خروجی:** مدیریت اسناد اخیر و عملیات مستقل PDF.

- Room schema، repository، migration test و atomic file writes.
- import تصویر/PDF با Photo Picker و SAF.
- تغییر نام، duplicate، delete، cleanup و low-storage handling.
- merge، split با range، و compression با سه preset.
- progress، cancel، retry و پیام خطای فارسی بر اساس error code.

**Gate:** سناریوی 50 صفحه‌ای و PDF صدصفحه‌ای بدون OOM/data loss؛ فایل خراب و
رمزدار پیام قابل فهم بدهد و فایل اصلی دست‌نخورده بماند.

## فاز 4 — OCR فارسی آفلاین

**خروجی:** OCR صفحه یا سند و خروجی متن.

- بسته آفلاین `fas` و `eng` و initialization idempotent.
- preprocessing مناسب OCR و اجرای صفحه‌به‌صفحه قابل لغو.
- نمایش/ویرایش نتیجه، copy و export TXT.
- normalization محافظه‌کارانه نویسه‌های فارسی بدون تغییر محتوای اصلی.
- benchmark روی عکس چاپی فارسی، انگلیسی و متن ترکیبی.

**Gate:** fixtureهای خوانا با معیار CER ثبت‌شده ارزیابی شوند؛ crash/OOM صفر و
حالت airplane mode کاملاً قابل استفاده باشد.

## فاز 5 — سخت‌سازی و Release Candidate

**خروجی:** AAB/APK امضاشده و بسته آماده ارسال به استورها.

- accessibility، RTL، dark mode، font scaling و tablet sanity check.
- benchmark launch، memory، battery و size؛ baseline profile در صورت اثربخشی.
- تست API 26/29/33/36، rotation، background، process death و فضای کم.
- threat review، dependency audit، NOTICE، privacy policy و data-safety answers.
- icon، screenshots، توضیحات فارسی، changelog و support URL.
- signing key، backup، versionCode policy و rollback artifact.
- closed test قبل از انتشار عمومی.

**Gate:** همه release checks سبز؛ هیچ P0/P1 باز؛ artifact نهایی از commit tag شده
قابل بازتولید باشد. انتشار فقط با تأیید دستی مالک پروژه.

## فاز 6 — پس از انتشار

برای حداقل دو هفته فقط داده‌های privacy-safe و بازخورد استور بررسی می‌شود. چون MVP
مجوز اینترنت ندارد، analytics داخلی در نسخه 1.0 وجود ندارد؛ سنجش اولیه از آمار
استورها، crash گزارش‌شده توسط کاربر و فرم بازخورد وب انجام می‌شود.

اولویت بعدی فقط با شواهد انتخاب می‌شود: searchable PDF، batch scan، backup انتخابی،
پرداخت داخلی یا app دوم. هیچ‌کدام از قبل وارد backlog اجرایی MVP نمی‌شوند.

## ترتیب کار روزانه پیشنهادی

1. صبح: یک task کوچک با تست و معیار پذیرش مشخص.
2. Codex: پیاده‌سازی یا refactor محدود در یک branch.
3. OpenCode: review مستقل diff و اجرای تست‌های مرتبط.
4. انسان: تست روی گوشی و ثبت ایراد واقعی.
5. پایان روز: commitهای کوچک، roadmap update و branch پاک.

Codex و OpenCode هم‌زمان روی یک working tree نمی‌نویسند. برای کار موازی از Git
worktree یا branch جدا استفاده می‌شود و ادغام فقط بعد از review انجام می‌گیرد.
