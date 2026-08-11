# PTB-ARC-004 — معماری خانواده اپ‌های Android

**وضعیت:** مصوب برای شروع فنی

**تاریخ:** 2026-08-11

**محصول اول:** جعبه‌ابزار اسناد فارسی

## 1. تصمیم

نسخه Android یک محصول Native با Kotlin و Jetpack Compose است؛ TWA، WebView و
Capacitor هسته محصول نیستند. کد Android در workspace مستقل `android/` داخل همین
مخزن نگه‌داری می‌شود. یک app module محصول را بسته‌بندی می‌کند و قابلیت‌های قابل
استفاده مجدد در `core`، `processing` و `feature` قرار می‌گیرند.

این ساختار اجازه می‌دهد در آینده برای هر دسته یک اپ جدا منتشر شود، بدون کپی‌کردن
دوربین، ذخیره‌سازی، طراحی، PDF، OCR یا تست‌ها. تا وقتی شواهد بازار وجود ندارد فقط
`:apps:documents` ساخته می‌شود؛ ایجاد app moduleهای فرضی ممنوع است.

## 2. اصول غیرقابل مذاکره

- local-first: تصویر، PDF و متن کاربر از دستگاه خارج نمی‌شود.
- بدون ثبت‌نام، تبلیغ، پرداخت، backend، Firebase و Google Play Services در MVP.
- اپ پس از نصب، بدون اینترنت قابل استفاده است؛ مدل‌های `fas` و `eng` OCR همراه
  بسته منتشر می‌شوند.
- فقط dependencyهای رایگان با مجوز سازگار با Apache-2.0 پذیرفته می‌شوند.
- هر موتور پردازشی پشت interface داخلی قرار می‌گیرد و با contract test سنجیده
  می‌شود؛ featureها مستقیماً API کتابخانه ثالث را مصرف نمی‌کنند.
- فایل‌ها با Storage Access Framework صادر می‌شوند؛ مجوز broad storage درخواست
  نمی‌شود.
- متن رابط کاربری فارسی و RTL است. نام کلاس، API، commit و مسیر فایل انگلیسی است.
- نسخه‌های stable به‌صورت دقیق در version catalog pin می‌شوند. dynamic version و
  dependency از JitPack ممنوع است.

## 3. محدوده MVP

### داخل محدوده

1. اسکن چندصفحه‌ای با CameraX.
2. تشخیص لبه، اصلاح دستی چهار گوشه و perspective correction.
3. فیلترهای Original، Color، Grayscale و Black & White.
4. چرخش، مرتب‌سازی و حذف صفحه.
5. ساخت PDF از اسکن یا تصاویر گالری.
6. ادغام، تقسیم و فشرده‌سازی PDF.
7. OCR آفلاین فارسی و انگلیسی و خروجی TXT/clipboard.
8. مدیریت سندهای اخیر، تغییر نام، حذف، export و share.

### خارج از محدوده

cloud sync، حساب کاربری، همکاری هم‌زمان، امضای دیجیتال، پرداخت، تبلیغات، اسکن
خودکار بدون تأیید کاربر، Word conversion، searchable-PDF با لایه متن RTL و ویرایش
محتوای برداری PDF. این موارد فقط پس از انتشار و شواهد استفاده بررسی می‌شوند.

## 4. ساختار Gradle

```text
android/
├── apps/
│   └── documents/           # applicationId و navigation root محصول اول
├── build-logic/             # convention plugins؛ تنظیمات مشترک build/test
├── core/
│   ├── common/              # Resultها، dispatchers و utilityهای بدون Android UI
│   ├── model/               # مدل‌های پایدار سند، صفحه و job
│   ├── designsystem/        # theme، typography RTL و componentهای مشترک
│   ├── database/            # Room؛ فقط metadata و وضعیت job
│   ├── files/               # internal storage، SAF، share و cleanup
│   └── testing/             # fakeها، fixtureها و assertionهای مشترک
├── processing/
│   ├── image/               # edge/crop/perspective/filter/encode
│   ├── pdf/                 # create/merge/split/compress/render
│   └── ocr/                 # OCR engine و Persian normalization
├── feature/
│   ├── home/
│   ├── scan/
│   ├── editor/
│   ├── pdf-tools/
│   ├── ocr/
│   └── settings/
├── gradle/libs.versions.toml
├── settings.gradle.kts
└── README.md
```

وابستگی جهت‌دار است: `apps -> feature -> core/processing` و `processing ->
core:model/common`. هیچ `core` یا `processing`ی به feature یا app وابسته نیست.
featureها به یکدیگر وابسته نمی‌شوند؛ navigation root در app آن‌ها را ترکیب می‌کند.

## 5. پشته فنی و سیاست dependency

| نیاز       | انتخاب پایه                                                     | دلیل و مرز                                             |
| ---------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| زبان/build | Kotlin، Gradle Kotlin DSL، JDK 17، version catalog              | یک build قابل تکرار در Windows و CI                    |
| UI         | Jetpack Compose + Material 3                                    | Native، تست‌پذیر و مناسب RTL                           |
| دوربین     | CameraX stable                                                  | سازگاری بهتر بین دستگاه‌ها؛ بدون API ابری              |
| DI         | constructor injection دستی                                      | برای اندازه MVP کافی؛ افزودن Hilt فقط با شواهد پیچیدگی |
| metadata   | Room                                                            | migration و تست پایگاه داده محلی                       |
| کار سنگین  | Kotlin Coroutines؛ WorkManager فقط برای کار ادامه‌پذیر          | UI thread هرگز فایل را پردازش نمی‌کند                  |
| تصویر      | OpenCV Android AAR از Maven Central                             | Apache-2.0؛ فقط پشت `ImageProcessor`                   |
| PDF        | Android `PdfDocument`/`PdfRenderer` + PdfBox-Android            | ساخت با platform API؛ عملیات ساختاری پشت `PdfEngine`   |
| OCR        | Tesseract4Android + tessdata رسمی `fas`/`eng`                   | Apache-2.0؛ کاملاً آفلاین و قابل تعویض                 |
| تست        | JUnit، kotlinx-coroutines-test، Compose UI test، Macrobenchmark | pyramid تست + benchmark روی دستگاه واقعی               |

PdfBox-Android و Tesseract4Android قبل از پذیرش نهایی باید spike را بگذرانند:
release build با R8، فایل فارسی رمزدار/خراب، سند 100 صفحه‌ای، لغو job، peak memory و
خروجی روی ARM64. اگر gate رد شود فقط adapter همان engine عوض می‌شود.

`minSdk=26`، `targetSdk=36` و `compileSdk=36` مبنای نسخه اول هستند. baseline build
از AGP 9.3.x، Gradle 9.5، JDK 17 و Kotlin 2.4.x استفاده می‌کند و patch دقیق در
version catalog ثبت می‌شود. فقط stable release پذیرفته می‌شود.

## 6. مدل داده و فایل

Room فقط metadata نگه می‌دارد:

- `Document(id, title, createdAt, updatedAt, coverPageId, pageCount, state)`
- `DocumentPage(id, documentId, order, sourcePath, processedPath, rotation, filter)`
- `ProcessingJob(id, documentId, type, progress, state, errorCode)`
- `OcrResult(pageId, language, text, createdAt)`

فایل خام و پردازش‌شده در app-specific internal storage قرار می‌گیرد. write اتمیک
است: ابتدا temporary file، سپس fsync/close و rename. رکورد دیتابیس فقط پس از موفقیت
فایل commit می‌شود. cleanup job فایل temporary قدیمی و orphan را حذف می‌کند.
حذف سند، فایل‌ها و metadata را idempotent پاک می‌کند.

## 7. جریان اصلی

1. CameraX یک عکس را در session موقت ذخیره می‌کند.
2. `ImageProcessor.detectDocument()` چهار گوشه پیشنهادی را برمی‌گرداند.
3. کاربر گوشه‌ها را تأیید یا اصلاح می‌کند.
4. perspective correction و filter روی dispatcher محاسباتی اجرا می‌شود.
5. `DocumentRepository` فایل پردازش‌شده و metadata صفحه را اتمیک ثبت می‌کند.
6. کاربر صفحات را مرتب می‌کند و `PdfEngine.create()` خروجی موقت می‌سازد.
7. خروجی با SAF ذخیره یا با content URI و permission موقت share می‌شود.

OCR از فایل پردازش‌شده استفاده می‌کند، قابل لغو است و نتیجه صفحه‌به‌صفحه ذخیره
می‌شود. crash یا بسته‌شدن اپ نباید سند ثبت‌شده را خراب کند.

## 8. قراردادهای engine

```kotlin
interface ImageProcessor {
    suspend fun detectDocument(input: ImageRef): DetectionResult
    suspend fun transform(input: ImageRef, crop: Quadrilateral, filter: PageFilter): ImageRef
}

interface PdfEngine {
    suspend fun create(pages: List<ImageRef>, output: FileRef, options: PdfOptions): PdfResult
    suspend fun merge(inputs: List<FileRef>, output: FileRef): PdfResult
    suspend fun split(input: FileRef, ranges: List<PageRange>, outputDir: DirectoryRef): List<PdfResult>
    suspend fun compress(input: FileRef, output: FileRef, quality: CompressionQuality): PdfResult
}

interface OcrEngine {
    suspend fun recognize(input: ImageRef, languages: Set<OcrLanguage>): OcrText
}
```

engineها progress و cancellation را از لایه job دریافت می‌کنند. exception کتابخانه
ثالث از boundary عبور نمی‌کند و به error codeهای `INVALID_INPUT`, `ENCRYPTED_PDF`,
`OUT_OF_SPACE`, `OUT_OF_MEMORY`, `CANCELLED` و `ENGINE_FAILURE` تبدیل می‌شود.

## 9. امنیت و حریم خصوصی

- `INTERNET` در manifest نسخه MVP وجود ندارد.
- backup فایل‌های سند و OCR غیرفعال است؛ تنظیمات غیرحساس می‌توانند backup شوند.
- export فقط با اقدام صریح کاربر است.
- URI فایل داخلی مستقیم منتشر نمی‌شود؛ `FileProvider` و grant موقت استفاده می‌شود.
- EXIF غیرضروری هنگام ساخت خروجی حذف می‌شود.
- crash report حاوی نام، مسیر، متن OCR یا محتوای فایل نیست. MVP سرویس crash ابری ندارد.
- dependency verification، lock و SBOM/notice در release gate اجرا می‌شود.

## 10. تست و معیار عملکرد

- unit/contract test برای همه engineها و repositoryها.
- golden fixtures شامل متن فارسی/انگلیسی، لبه ضعیف، چرخش، PDF خراب و PDF رمزدار.
- instrumented test برای CameraX، SAF، Room migration، process death و RTL.
- حداقل دو دستگاه واقعی: یک دستگاه ضعیف API 26–28 و یک دستگاه رایج API 33+.
- launch سرد روی دستگاه مرجع کمتر از 2 ثانیه، preview دوربین بدون freeze محسوس، و
  پردازش هر صفحه 12MP بدون عبور از 256MB peak memory هدف‌گذاری می‌شود.
- هیچ عملیات فایل/تصویر روی main thread و هیچ crash/OOM در سناریوی 50 صفحه‌ای مجاز نیست.

## 11. انتشار و خانواده محصولات

کلید signing خارج از Git و با backup رمزگذاری‌شده نگه‌داری می‌شود. CI برای هر PR
lint، unit test، dependency verification و debug assemble را اجرا می‌کند. release
محلی یا CI فقط artifact امضاشده تولید می‌کند و انتشار در بازار/مایکت/Google Play
یک اقدام دستی است.

هر app آینده applicationId، branding، navigation و feature set خود را دارد اما
هسته مشترک را مصرف می‌کند. app جدید فقط وقتی ساخته می‌شود که داده بازار یا رفتار
کاربر مسئله‌ای مستقل را اثبات کند؛ multi-app strategy یک قابلیت معماری است، نه
تعهد به انتشار چند اپ از روز اول.

## 12. منابع تصمیم

- [AndroidX releases](https://developer.android.com/jetpack/androidx/versions)
- [CameraX releases](https://developer.android.com/jetpack/androidx/releases/camera)
- [Google Play target API requirement](https://developer.android.com/google/play/requirements/target-sdk)
- [Android Studio on Windows](https://developer.android.com/studio/install)
- [OpenCV Android](https://docs.opencv.org/4.x/d5/df8/tutorial_dev_with_OCV_on_Android.html)
- [Tesseract4Android](https://github.com/adaptech-cz/Tesseract4Android)
- [PdfBox-Android](https://github.com/TomRoush/PdfBox-Android)
