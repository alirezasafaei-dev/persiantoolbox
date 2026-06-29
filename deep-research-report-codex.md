# Deep Research Report: PersianToolbox Monetization & Growth

تاریخ: 2026-06-29  
سایت: https://persiantoolbox.ir/  
ریپو: https://github.com/alirezasafaei-dev/persiantoolbox  
تمرکز: ابزارهای فارسی، RTL، privacy-first/local-first، قابل تبدیل به خرید تکی، credit/export یا اشتراک

> نکته روش‌شناسی: تحلیل محصول از سایت و فایل‌های ریپو انجام شده است. ادعاهای دقیق درباره حجم جستجو، قیمت رقبا و رفتار بازار ایران بدون دسترسی به Search Console، Keyword Planner، داده پرداخت و analytics داخلی قطعی نیستند و با برچسب «نیازمند بررسی دستی/Search Console/Keyword Planner» در نظر گرفته شده‌اند.

## 1. Executive Summary

### 5 فرصت پولی برتر

| رتبه | فرصت                                                               | چرا fit دارد؟                                                                | مدل درآمدی پیشنهادی                    | سرعت درآمد |
| ---: | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------- | ---------- |
|    1 | Clean Export Credit برای PDF/Word فاکتور، رزومه و نامه             | زیرساخت credit/export در ریپو وجود دارد و محتوا می‌تواند در مرورگر بماند     | خرید تکی/بسته credit                   | خیلی سریع  |
|    2 | Business Documents Pro: فاکتور، پیش‌فاکتور، رسید، پروفایل کسب‌وکار | flagship فعلی است و نیاز تجاری مستقیم دارد                                   | credit + اشتراک Basic                  | سریع       |
|    3 | Career Pack: رزومه فارسی/انگلیسی + کاورلتر + خروجی Word/PDF        | محصول فعلی دارد و moment of upgrade در export طبیعی است                      | خرید تکی + credit                      | سریع       |
|    4 | Contract & Formal Letter Pack                                      | تغییرات ریپو نشان می‌دهد مسیر قرارداد/نامه شروع شده؛ ارزش خروجی بالاست       | خرید تکی هر سند + credit               | متوسط      |
|    5 | Persian Writing Pro                                                | local-first قوی، ابزار فارسی متمایز، upgrade بر اساس متن طولانی/strict/batch | اشتراک سبک + credit برای export report | متوسط      |

### سریع‌ترین مسیر اولین درآمد

1. باگ subscription status را اصلاح کنید: API در `app/api/subscription/status/route.ts` آبجکت `planInfo` برمی‌گرداند، اما `shared/hooks/useSubscriptionStatus.ts` فیلد `subscription.active` و `subscription.planId` را چک می‌کند. این mismatch احتمالاً premium gate را خراب می‌کند.
2. پکیج `pack-3` را CTA اصلی کنید: 3 خروجی حرفه‌ای، 49,000 تومان، بدون اشتراک.
3. همه exportهای حرفه‌ای را از `/api/export/token` عبور دهید و product enum را برای ابزارهای جدید توسعه دهید.
4. قبل از ساخت سنگین، fake-door CTA روی landingهای فاکتور، رزومه، نامه رسمی و قرارداد بگذارید.

## 2. Current Product Diagnosis

### وضعیت فعلی محصول

| حوزه          | وضعیت مشاهده‌شده                                                                                                               | فایل/مسیر مهم                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Stack         | Next.js 16، TypeScript strict، Tailwind، PostgreSQL، Redis، PM2، pnpm                                                          | `package.json`, `README.md`                                                                            |
| ابزارها       | 80+ ابزار؛ registry حدود 94 entry در دسته‌های PDF، image، date، text، finance، validation، contract، business، career، writing | `lib/tools-registry.ts`                                                                                |
| flagship      | فاکتورساز و رسیدساز، رزومه‌ساز حرفه‌ای، ویرایشگر فارسی                                                                         | `lib/navigation.ts`, `app/page.tsx`                                                                    |
| pricing       | بسته‌های credit و پلن‌های Basic/Standard/Pro                                                                                   | `lib/pricing/exportCredits.ts`, `components/features/pricing/`                                         |
| پرداخت        | ZarinPal checkout/callback/history + subscription APIs                                                                         | `app/api/payments/`, `app/api/subscription/`                                                           |
| export credit | reserve/check/confirm/cancel با token امضاشده                                                                                  | `app/api/export/token/route.ts`, `lib/server/credit-metering.ts`, `lib/server/export-token.ts`         |
| premium gates | business/career/writing دارای free limits و premium features                                                                   | `lib/business-documents/schemas.ts`, `lib/career-documents/schemas.ts`, `lib/persian-writing/types.ts` |
| privacy       | ابزارها عمدتاً client-side؛ token فقط entitlement را کنترل می‌کند، نه محتوای سند                                               | معماری export token                                                                                    |

### جدول ابزارها و دسته‌بندی‌ها

| دسته                       | نمونه ابزارهای موجود/قابل مشاهده                             | پتانسیل پولی             |
| -------------------------- | ------------------------------------------------------------ | ------------------------ |
| Business                   | فاکتور، پیش‌فاکتور، رسید                                     | بسیار بالا               |
| Career                     | رزومه فارسی، رزومه انگلیسی، کاورلتر                          | بالا                     |
| Writing                    | نرمال‌سازی فارسی، نیم‌فاصله، پاک‌سازی، آمار متن              | بالا                     |
| Contract                   | قرارداد اجاره، پیمانکاری/ساخت، مسیرهای جدید قرارداد فروش/کار | بالا ولی ریسک حقوقی دارد |
| PDF                        | ابزارهای PDF                                                 | متوسط تا بالا            |
| Finance                    | محاسبات مالی                                                 | متوسط                    |
| Date/Text/Image/Validation | ابزارهای free SEO                                            | عمدتاً acquisition       |

### شکاف‌های محصولی

| شکاف                                                     | اثر                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| مدل entitlement محدود به `business                       | career                                                                | writing` | ابزارهای جدید قرارداد/نامه/گواهی کار وارد credit نمی‌شوند مگر enum و UI توسعه یابد |
| export حرفه‌ای برای همه ابزارها یکپارچه نیست             | monetization پراکنده می‌شود                                           |
| history/account-light برای خرید تکی کامل نیست            | کاربر بعد از پرداخت باید تجربه بازیابی قابل اعتماد داشته باشد         |
| SEO landing برای ابزارهای پولی باید transactionalتر شود  | ابزار رایگان traffic می‌آورد، اما صفحه فروش باید خروجی پولی را بفروشد |
| AI assist اختیاری هنوز باید cost-control دقیق داشته باشد | خطر هزینه و ارسال داده حساس                                           |

### شکاف‌های monetization

| شکاف                                | پیشنهاد                                                             |
| ----------------------------------- | ------------------------------------------------------------------- |
| paywall قبل از value نباید دیده شود | preview کامل رایگان، clean export پولی                              |
| اشتراک مانع خرید است                | خرید تکی و pack credit را primary کنید                              |
| پلن‌های بزرگ برای شروع سنگین‌اند    | `pack-3` و `basic` را به‌عنوان entry price برجسته کنید              |
| business profile پولی نشده          | ذخیره لوگو، مهر، شماره اقتصادی، اطلاعات فروشنده به add-on تبدیل شود |

### محدودیت‌های فنی

| محدودیت                        | ریسک                               | اقدام                                               |
| ------------------------------ | ---------------------------------- | --------------------------------------------------- |
| mismatch subscription API/hook | premium false و افت conversion     | اصلاح contract hook/API                             |
| token expiry 60 ثانیه          | exportهای سنگین ممکن است fail شوند | retry UX و reserve/cancel شفاف                      |
| محتوای سند نباید سرور برود     | محدودیت برای AI/history            | history محلی؛ AI opt-in با redaction                |
| PDF/DOCX فارسی                 | کیفیت font/RTL ممکن است دشوار باشد | template تست‌شده، snapshot/export tests             |
| مسیرهای DB-heavy               | هزینه اجرا                         | تا درآمد اولیه، فقط payment/credits/analytics ضروری |

### مزیت‌های رقابتی فعلی

- local-first/privacy-first برای اسناد حساس فارسی.
- RTL واقعی و ابزارهای فارسی‌محور.
- خروجی PDF/Word حرفه‌ای به‌عنوان نقطه monetization طبیعی.
- registry و صفحات SEO آماده برای رشد long-tail.
- payment/credit infrastructure تا حدی آماده است.

## 3. Market & Competitor Research

### منابع رقبا و الهام

| رقیب/دسته          | مدل پولی مشاهده‌شده                                         | moment of upgrade               | منبع                                       |
| ------------------ | ----------------------------------------------------------- | ------------------------------- | ------------------------------------------ |
| Smallpdf           | Pro subscription برای ابزارهای PDF، محدودیت استفاده در free | پس از limit/export/batch        | https://smallpdf.com/pricing               |
| iLovePDF           | Premium برای محدودیت بیشتر، batch و بدون تبلیغ              | بعد از استفاده مکرر/فایل بزرگ   | https://www.ilovepdf.com/pricing           |
| Adobe Acrobat      | subscription برای PDF editing/export/sign                   | هنگام edit/export حرفه‌ای       | https://www.adobe.com/acrobat/pricing.html |
| PDF24              | ابزارهای رایگان PDF                                         | monetization مستقیم کمتر        | https://tools.pdf24.org/                   |
| Resume.io          | resume templates/export با subscription/trial               | هنگام دانلود رزومه              | https://resume.io/pricing                  |
| Enhancv            | resume builder paid plan                                    | هنگام export/branding/template  | https://enhancv.com/pricing/               |
| Grammarly          | writing assistant freemium + premium                        | پیشنهادهای پیشرفته              | https://www.grammarly.com/plans            |
| QuillBot           | paraphrase/writing premium                                  | محدودیت mode/length             | https://quillbot.com/premium               |
| LanguageTool       | grammar premium                                             | advanced suggestions            | https://languagetool.org/premium           |
| PandaDoc           | document automation subscription                            | template, e-sign, workflow      | https://www.pandadoc.com/pricing/          |
| Danapardaz فاکتور  | فاکتورساز آنلاین ایرانی                                     | نیازمند بررسی قیمت/feature دستی | https://danapardaz.net/                    |
| Webzi فاکتور       | فاکتورساز آنلاین                                            | نیازمند بررسی دستی              | https://webzi.ir/                          |
| Formafzar فاکتور   | فرم/فاکتور آنلاین                                           | نیازمند بررسی دستی              | https://formafzar.com/                     |
| Karboom رزومه      | رزومه‌ساز ایرانی                                            | دانلود/قالب/خدمات شغلی          | https://karboom.io/                        |
| e-estekhdam رزومه  | رزومه‌ساز ایرانی                                            | دانلود و اکوسیستم استخدام       | https://www.e-estekhdam.com/               |
| CVBuilder/CVResume | رزومه‌ساز ایرانی                                            | خروجی/قالب                      | نیازمند بررسی دستی                         |
| Dadline قرارداد    | قرارداد/خدمات حقوقی                                         | خرید سند/مشاوره                 | نیازمند بررسی دستی                         |

### برداشت بازار

| حوزه             | ضعف رایج بازار فارسی                               | فرصت PersianToolbox                                          |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| فاکتور/رسید      | خروجی غیرحرفه‌ای، نبود حریم خصوصی، template محدود  | سند حرفه‌ای local-first با export تمیز                       |
| رزومه            | قالب‌های تکراری، paywall قبل از ارزش، RTL/LTR ناقص | preview کامل، Word/PDF تمیز، فارسی/انگلیسی                   |
| ویرایش فارسی     | ابزارهای پراکنده، خروجی گزارشی کم                  | writing studio با report/export و batch                      |
| PDF فارسی        | مشکل فونت/RTL/OCR                                  | ابزارهای PDF فارسی با حفظ فایل در مرورگر                     |
| قرارداد          | ریسک حقوقی و متن عمومی                             | template با disclaimer، خروجی قابل ویرایش، بدون مشاوره حقوقی |
| مالیات/بیمه/حقوق | قوانین متغیر و حساسیت بالا                         | calculator با تاریخ قانون، citation، عدم ادعای مشاوره        |

## 4. Opportunity Map

|   # | ابزار                          | کاربر هدف          | درد                 | خروجی پولی                 | مدل           | قیمت پیشنهادی | Keyword                   | سختی | درآمد | Local fit | ریسک | اولویت | دلیل                       |
| --: | ------------------------------ | ------------------ | ------------------- | -------------------------- | ------------- | ------------: | ------------------------- | ---: | ----: | --------: | ---: | ------ | -------------------------- |
|   1 | خروجی تمیز فاکتور PDF/Word     | فریلنسر/فروشگاه    | فاکتور قابل ارسال   | PDF/Word بدون واترمارک     | credit        |    19k/export | فاکتورساز آنلاین          |    2 |     5 |         5 |    1 | P0     | محصول آماده و نیاز مستقیم  |
|   2 | بسته 3 خروجی حرفه‌ای           | همه کاربران سند    | خرید کم‌ریسک        | 3 credit                   | خرید تکی      |           49k | خرید خروجی فاکتور         |    1 |     5 |         5 |    1 | P0     | سریع‌ترین revenue          |
|   3 | پروفایل کسب‌وکار               | کسب‌وکار کوچک      | ورود تکراری اطلاعات | لوگو/مهر/اطلاعات ذخیره‌شده | add-on/اشتراک |        99k/mo | فاکتور با لوگو            |    3 |     4 |         4 |    2 | P0     | retention بالا             |
|   4 | پیش‌فاکتور حرفه‌ای             | فروشنده/پیمانکار   | ارسال قیمت رسمی     | PDF/Word                   | credit        |           19k | پیش فاکتور آنلاین         |    2 |     4 |         5 |    1 | P0     | نزدیک به invoice           |
|   5 | رسیدساز حرفه‌ای                | خدمات/فروشگاه      | رسید سریع           | PDF/print                  | credit        |           15k | رسیدساز آنلاین            |    2 |     4 |         5 |    2 | P0     | تراکنشی و سریع             |
|   6 | رزومه فارسی حرفه‌ای            | کارجو              | رزومه شکیل          | PDF/Word clean             | credit        |           29k | رزومه ساز فارسی           |    2 |     5 |         5 |    1 | P0     | flagship آماده             |
|   7 | رزومه انگلیسی LTR              | مهاجرت/ریموت       | فرمت انگلیسی        | DOCX/PDF ATS               | credit        |           39k | رزومه ساز انگلیسی         |    3 |     4 |         5 |    1 | P0     | willingness بالاتر         |
|   8 | کاورلترساز                     | کارجو              | متن اختصاصی         | Word/PDF                   | credit        |           19k | کاور لتر ساز              |    2 |     3 |         5 |    1 | P1     | attach به رزومه            |
|   9 | نامه رسمی اداری                | کارمند/کسب‌وکار    | نگارش رسمی          | نامه Word/PDF              | credit        |           19k | نامه اداری آماده          |    2 |     4 |         5 |    2 | P0     | مسیر جدید در ریپو          |
|  10 | گواهی اشتغال به کار            | HR/کارمند          | سند استاندارد       | PDF/Word                   | credit        |           19k | گواهی اشتغال به کار       |    2 |     4 |         5 |    2 | P1     | مسیر جدید در ریپو          |
|  11 | قرارداد اجاره                  | موجر/مستاجر        | متن قرارداد         | DOCX/PDF                   | credit        |           49k | قرارداد اجاره             |    3 |     4 |         5 |    4 | P1     | ارزش بالا، disclaimer لازم |
|  12 | قرارداد فروش                   | خریدار/فروشنده     | سند معامله          | DOCX/PDF                   | credit        |           49k | قرارداد فروش              |    3 |     4 |         5 |    4 | P1     | مسیر جدید در ریپو          |
|  13 | قرارداد کار                    | کارفرما/کارمند     | چارچوب استخدام      | DOCX/PDF                   | credit        |           49k | قرارداد کار               |    3 |     4 |         5 |    4 | P1     | نیاز قوانین به‌روز         |
|  14 | قرارداد پیمانکاری              | پیمانکار           | clauses استاندارد   | DOCX/PDF                   | credit        |           59k | قرارداد پیمانکاری         |    4 |     4 |         5 |    4 | P1     | ارزش بالاتر                |
|  15 | ویرایشگر فارسی Pro             | نویسنده/ادمین سایت | متن تمیز            | report/export              | اشتراک        |        99k/mo | ویرایش متن فارسی          |    3 |     4 |         5 |    1 | P1     | ابزار متمایز               |
|  16 | Batch text cleanup             | ناشر/سئوکار        | چند فایل متنی       | batch export               | credit/Pro    |           99k | اصلاح نیم فاصله           |    3 |     3 |         5 |    1 | P2     | power user                 |
|  17 | گزارش کیفیت متن                | تولیدکننده محتوا   | اثبات کیفیت         | PDF report                 | credit        |           15k | غلط یاب فارسی             |    3 |     3 |         5 |    2 | P2     | value برای تیم محتوا       |
|  18 | PDF فارسی به Word              | دانشجو/اداره       | تبدیل قابل ویرایش   | DOCX                       | credit        |           29k | تبدیل PDF به Word فارسی   |    4 |     5 |         3 |    2 | P2     | رقابت زیاد                 |
|  19 | OCR فارسی local/optional       | کاربران اسکن       | استخراج متن         | TXT/DOCX                   | credit        |           39k | OCR فارسی                 |    4 |     5 |         3 |    2 | P2     | کیفیت چالش                 |
|  20 | امضای PDF محلی                 | کسب‌وکار           | امضای سند           | signed PDF                 | credit        |           19k | امضای PDF آنلاین          |    3 |     4 |         5 |    3 | P2     | نیاز trust copy            |
|  21 | واترمارک/حذف واترمارک خودی     | تولیدکننده سند     | branding            | PDF branded                | add-on        |           49k | ساخت فاکتور با برند       |    2 |     3 |         5 |    1 | P2     | add-on خوب                 |
|  22 | گزارش مالی ساده فریلنسر        | فریلنسر            | جمع درآمد/هزینه     | PDF report                 | اشتراک        |        99k/mo | گزارش درآمد فریلنسر       |    4 |     3 |         4 |    2 | P3     | DB/history می‌خواهد        |
|  23 | محاسبه خسارت تأخیر تأدیه       | حقوقی/مالی         | محاسبه حساس         | PDF محاسبه                 | credit        |           29k | محاسبه خسارت تاخیر تادیه  |    3 |     4 |         5 |    4 | P2     | قوانین/شاخص لازم           |
|  24 | ماشین حساب چک و سفته           | کسب‌وکار           | تاریخ/مبلغ/ریسک     | گزارش PDF                  | credit        |           19k | محاسبه سفته               |    3 |     3 |         5 |    3 | P3     | نیاز citation حقوقی        |
|  25 | حقوق و دستمزد                  | HR کوچک            | محاسبه حقوق         | فیش حقوقی                  | اشتراک        |       149k/mo | محاسبه حقوق و دستمزد      |    4 |     5 |         4 |    4 | P2     | قوانین متغیر               |
|  26 | مالیات بر ارزش افزوده          | فروشگاه            | محاسبه VAT          | گزارش/فاکتور               | free+credit   |           19k | محاسبه مالیات ارزش افزوده |    3 |     4 |         5 |    3 | P2     | نرخ قانونی متغیر           |
|  27 | فیش حقوقی                      | کارفرما            | خروجی رسمی‌تر       | PDF/Word                   | credit        |           29k | فیش حقوقی آنلاین          |    4 |     4 |         4 |    4 | P2     | حساس                       |
|  28 | Quote/Proposal ساز             | مشاور/آژانس        | پیشنهاد قیمت        | PDF proposal               | credit        |           49k | پروپوزال قیمت             |    3 |     4 |         5 |    2 | P1     | نزدیک business docs        |
|  29 | قرارداد سالن زیبایی/رزرو خدمات | سالن‌ها            | توافق خدمات         | PDF                        | credit        |           39k | قرارداد خدمات سالن زیبایی |    3 |     3 |         5 |    3 | P3     | niche                      |
|  30 | ابزار املاک: مبایعه‌نامه ساده  | مشاور املاک        | پیش‌نویس            | DOCX/PDF                   | credit        |           59k | مبایعه نامه               |    4 |     4 |         5 |    5 | P3     | ریسک حقوقی بالا            |
|  31 | صورتجلسه‌ساز                   | شرکت کوچک          | متن جلسه            | Word/PDF                   | credit        |           19k | صورتجلسه آماده            |    2 |     3 |         5 |    2 | P1     | کم‌ریسک و اداری            |
|  32 | رسید پرداخت نقدی/کارت          | فروشگاه            | سند پرداخت          | PDF/print                  | credit        |           15k | رسید پرداخت               |    2 |     4 |         5 |    2 | P0     | ساده و فروش‌پذیر           |
|  33 | فاکتور batch از CSV            | فروشگاه            | صدور چند فاکتور     | batch PDF                  | credit/Pro    |           99k | صدور فاکتور گروهی         |    4 |     4 |         4 |    2 | P2     | premium واضح               |
|  34 | قالب‌های premium رزومه         | کارجو              | تمایز ظاهری         | template unlock            | add-on        |           39k | قالب رزومه حرفه ای        |    2 |     4 |         5 |    1 | P1     | margin بالا                |
|  35 | قالب‌های premium فاکتور        | کسب‌وکار           | برندینگ             | template unlock            | add-on        |           39k | قالب فاکتور حرفه ای       |    2 |     4 |         5 |    1 | P1     | add-on طبیعی               |

## 5. Top 10 Paid Tools

| ابزار                | Problem                   | Persona           | Free Experience            | Paid Trigger              | Paid Features             | Pricing       | Pages                             | Components                 | APIs                | DB                | Privacy    | Risks           | Acceptance Criteria          | MVP                | V2               |
| -------------------- | ------------------------- | ----------------- | -------------------------- | ------------------------- | ------------------------- | ------------- | --------------------------------- | -------------------------- | ------------------- | ----------------- | ---------- | --------------- | ---------------------------- | ------------------ | ---------------- |
| Clean Invoice Export | نیاز به فاکتور قابل ارسال | فریلنسر/فروشگاه   | ساخت و preview با واترمارک | کلیک export PDF/DOCX      | بدون واترمارک، لوگو، DOCX | 19k یا credit | `/business-tools/document-studio` | export modal, pricing card | `/api/export/token` | payments, credits | سند local  | شکست export/RTL | export موفق و credit confirm | enable paid export | batch/brand      |
| Pack-3 Credit        | خرید کم‌ریسک              | همه               | ابزار رایگان               | دومین export/clean export | 3 خروجی                   | 49k           | `/pricing`, modals                | UpgradeModal               | checkout/token      | payments/credits  | no content | ابهام اعتبار    | خرید و مصرف credit           | primary CTA        | gifting          |
| Resume Pro Export    | رزومه حرفه‌ای             | کارجو             | preview واترمارک           | دانلود                    | PDF/DOCX clean، قالب      | 29k           | `/career-tools/resume-builder`    | resume export modal        | token               | credits           | local      | کیفیت ATS       | PDF/DOCX clean               | 2 templates        | ATS score        |
| English Resume       | رزومه LTR                 | مهاجرت/ریموت      | preview                    | export                    | LTR DOCX/PDF              | 39k           | career                            | LTR template               | token               | credits           | local      | layout          | LTR valid                    | one template       | AI rewrite       |
| Cover Letter         | متن همراه رزومه           | کارجو             | تولید متن پایه             | export                    | قالب رسمی، DOCX           | 19k           | career                            | letter wizard              | token               | credits           | local      | generic text    | export                       | MVP form           | job-specific AI  |
| Formal Letter        | نامه اداری                | عموم/شرکت         | preview                    | Word/PDF                  | سربرگ، قالب               | 19k           | `/writing-tools/formal-letter`    | form/export                | token product جدید  | credits           | local      | حقوقی/لحن       | output clean                 | common templates   | batch            |
| Work Certificate     | گواهی اشتغال              | HR/کارمند         | preview                    | export                    | مهر/لوگو، Word            | 19k           | `/career-tools/work-certificate`  | form/export                | token product جدید  | credits           | local      | جعل/اعتماد      | disclaimer + output          | MVP                | business profile |
| Lease Agreement      | قرارداد اجاره             | موجر/مستاجر       | preview watermark          | export                    | DOCX/PDF clauses          | 49k           | `/contract-tools/lease-agreement` | contract wizard            | token product جدید  | credits           | local      | حقوقی بالا      | disclaimer + editable output | MVP template       | clause library   |
| Persian Writing Pro  | متن فارسی تمیز            | تولید محتوا/ادمین | 5000 char، modes پایه      | متن بلند/strict/report    | strict, batch, report     | 99k/mo        | writing studio                    | pro panel                  | subscription/status | subscription      | local      | کیفیت پیشنهاد   | no content server            | mode limits        | batch            |
| Proposal Builder     | پیشنهاد قیمت              | مشاور/آژانس       | preview                    | export                    | proposal PDF/Word         | 49k           | business tools                    | proposal wizard            | token               | credits           | local      | scope creep     | export                       | MVP                | e-sign           |

## 6. Top 5 MVP Backlog

### MVP 1: Fix Premium Entitlement + Credit Export

| آیتم         | جزئیات                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| فایل‌ها      | `app/api/subscription/status/route.ts`, `shared/hooks/useSubscriptionStatus.ts`, `shared/hooks/useExportToken.ts`, `lib/server/credit-metering.ts` |
| URL          | `/pricing`, existing flagship pages                                                                                                                |
| schema       | existing subscriptions/payments/credits                                                                                                            |
| API contract | `GET /api/subscription/status` باید `subscription.active`, `subscription.planId`, `credits.balance` استاندارد برگرداند                             |
| unit tests   | hook mapping، API response shape                                                                                                                   |
| E2E          | login -> buy credit -> export -> confirm                                                                                                           |
| edge cases   | expired plan، canceled payment، token expired، double confirm                                                                                      |
| CTA          | «خروجی حرفه‌ای بدون واترمارک»                                                                                                                      |
| modal        | «پیش‌نمایش رایگان است. برای دانلود PDF/Word تمیز، یک اعتبار مصرف می‌شود.»                                                                          |
| checklist    | typecheck، lint، vitest، build، تست پرداخت sandbox                                                                                                 |

### MVP 2: Business Document Clean Export

| آیتم       | جزئیات                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | -------- |
| فایل‌ها    | `components/features/business-documents/`, `lib/business-documents/`, `components/features/pricing/UpgradeModal.tsx` |
| URL        | `/business-tools/document-studio`                                                                                    |
| schema     | document type, seller, buyer, items, tax, discount, theme                                                            |
| API        | `POST /api/export/token { product:"business", format:"pdf                                                            | docx" }` |
| tests      | calculation/render/export token                                                                                      |
| E2E        | create invoice -> preview -> paid export                                                                             |
| edge cases | zero quantity، long item names، RTL numbers، logo upload                                                             |
| CTA        | «دانلود فاکتور حرفه‌ای»                                                                                              |
| paywall    | «نسخه رایگان با واترمارک است؛ خروجی تمیز فقط با یک اعتبار.»                                                          |

### MVP 3: Career Pack Export

| آیتم       | جزئیات                                                            |
| ---------- | ----------------------------------------------------------------- | -------- |
| فایل‌ها    | `components/features/career-documents/`, `lib/career-documents/`  |
| URL        | `/career-tools/resume-builder`                                    |
| schema     | profile, education, experience, skills, language, template        |
| API        | `POST /api/export/token { product:"career", format:"pdf           | docx" }` |
| tests      | RTL/LTR render، Word export                                       |
| E2E        | resume draft -> export PDF/DOCX                                   |
| edge cases | empty sections، long names، English layout                        |
| CTA        | «دانلود رزومه حرفه‌ای»                                            |
| paywall    | «رزومه را کامل بسازید؛ فقط دانلود تمیز و بدون واترمارک پولی است.» |

### MVP 4: Formal Letter Paid Export

| آیتم       | جزئیات                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| فایل‌ها    | `app/writing-tools/formal-letter/page.tsx`, `components/features/formal-letter/`, `lib/formal-letter/`, `app/api/export/token/route.ts` |
| URL        | `/writing-tools/formal-letter`                                                                                                          |
| schema     | sender, receiver, subject, body, tone, template, signature                                                                              |
| API        | extend token products: `formal-letter` یا document group                                                                                |
| tests      | render/export                                                                                                                           |
| E2E        | fill letter -> preview -> export                                                                                                        |
| edge cases | missing receiver، long body، signature image                                                                                            |
| CTA        | «دانلود نامه رسمی Word/PDF»                                                                                                             |
| paywall    | «پیش‌نمایش رایگان است؛ خروجی رسمی بدون واترمارک با یک اعتبار.»                                                                          |

### MVP 5: Contract Lease/Sale Paid Export

| آیتم       | جزئیات                                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| فایل‌ها    | `app/contract-tools/lease-agreement/page.tsx`, `app/contract-tools/sale-agreement/page.tsx`, `components/features/contract-*`, `lib/contract-*`, `app/api/export/token/route.ts` |
| URL        | `/contract-tools/lease-agreement`, `/contract-tools/sale-agreement`                                                                                                              |
| schema     | parties, subject, amount, dates, clauses, witnesses                                                                                                                              |
| API        | token products: `contract` یا granular IDs                                                                                                                                       |
| tests      | calculation، render، disclaimer presence                                                                                                                                         |
| E2E        | fill contract -> preview watermark -> export DOCX                                                                                                                                |
| edge cases | missing national ID، invalid dates، long clauses                                                                                                                                 |
| CTA        | «دانلود پیش‌نویس قرارداد قابل ویرایش»                                                                                                                                            |
| paywall    | «این ابزار مشاوره حقوقی نیست؛ خروجی Word/PDF حرفه‌ای با یک اعتبار فعال می‌شود.»                                                                                                  |

## 7. Pricing & Monetization

| محصول درآمدی      |         قیمت پیشنهادی | Anchor                | احتمال تبدیل   | ریسک  | دلیل                              |
| ----------------- | --------------------: | --------------------- | -------------- | ----- | --------------------------------- |
| خرید تکی PDF/Word |            19k تا 49k | هزینه تایپ/طراحی دستی | بالا           | پایین | بدون تعهد اشتراک                  |
| بسته 3 credit     |                   49k | کمتر از 3 خرید تکی    | بالا           | پایین | entry pack مناسب                  |
| بسته 10 credit    |                   99k | قیمت هر export کمتر   | متوسط          | پایین | برای استفاده تکراری               |
| Basic             |                99k/mo | 10 credit + templates | متوسط          | متوسط | برای freelancer/small biz         |
| Pro               |               399k/mo | 500 credit/batch      | پایین تا متوسط | متوسط | باید value واقعی batch داشته باشد |
| template add-on   |                   39k | قالب آماده حرفه‌ای    | متوسط          | پایین | margin بالا                       |
| business profile  |  99k/mo یا 99k یک‌بار | صرفه‌جویی زمان        | متوسط          | متوسط | نیاز auth/history                 |
| batch export      |            99k یا Pro | صرفه‌جویی زمان زیاد   | متوسط          | متوسط | power user                        |
| AI assist         | 49k add-on یا per-use | هزینه مدل             | نامطمئن        | بالا  | opt-in، redaction، cost cap لازم  |

## 8. SEO & Content Strategy

| ابزار پولی     | keyword اصلی        | long-tailها                                                                            | عنوان صفحه                                 | meta description                                                      | FAQ schema                                              | Intent                   | CTA                   |
| -------------- | ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------ | --------------------- |
| فاکتور حرفه‌ای | فاکتورساز آنلاین    | فاکتور با لوگو، فاکتور PDF، پیش فاکتور آنلاین، رسید آنلاین، فاکتور بدون واترمارک       | فاکتورساز آنلاین فارسی با خروجی PDF و Word | فاکتور، پیش‌فاکتور و رسید را در مرورگر بسازید و خروجی حرفه‌ای بگیرید. | آیا اطلاعات ارسال می‌شود؟ آیا Word دارد؟ واترمارک چیست؟ | transactional            | دانلود فاکتور حرفه‌ای |
| رسیدساز        | رسیدساز آنلاین      | رسید پرداخت، رسید نقدی، رسید کارت، رسید PDF، رسید فارسی                                | رسیدساز آنلاین فارسی                       | رسید پرداخت حرفه‌ای بسازید و PDF بگیرید.                              | اعتبار قانونی؟ چاپ؟ لوگو؟                               | transactional            | ساخت رسید             |
| رزومه فارسی    | رزومه ساز فارسی     | قالب رزومه فارسی، دانلود رزومه PDF، رزومه Word، رزومه بدون واترمارک، ساخت CV           | رزومه‌ساز فارسی حرفه‌ای                    | رزومه فارسی را با preview بسازید و خروجی PDF/Word بگیرید.             | ATS؟ عکس؟ Word؟                                         | transactional            | دانلود رزومه          |
| رزومه انگلیسی  | رزومه ساز انگلیسی   | English CV, resume builder, رزومه مهاجرتی، رزومه LTR، CV Word                          | رزومه‌ساز انگلیسی با خروجی Word            | رزومه انگلیسی LTR برای اپلای و ریموت بسازید.                          | LTR؟ قالب؟ PDF؟                                         | transactional            | ساخت رزومه انگلیسی    |
| کاورلتر        | کاور لتر ساز        | کاورلتر انگلیسی، نامه همراه رزومه، cover letter آماده، کاورلتر فارسی، cover letter PDF | کاورلترساز آنلاین                          | کاورلتر حرفه‌ای بسازید و Word/PDF بگیرید.                             | شخصی‌سازی؟ زبان؟ خروجی؟                                 | commercial               | ساخت کاورلتر          |
| نامه رسمی      | نامه اداری آماده    | نامه درخواست، نامه رسمی Word، نامه اداری PDF، متن نامه رسمی، سربرگ                     | نامه رسمی اداری آنلاین                     | نامه رسمی را با قالب اداری بسازید و خروجی Word/PDF بگیرید.            | قابل ویرایش؟ سربرگ؟ امضا؟                               | transactional            | دانلود نامه رسمی      |
| گواهی اشتغال   | گواهی اشتغال به کار | نمونه گواهی، گواهی برای سفارت، گواهی حقوق، گواهی Word، نامه HR                         | گواهی اشتغال به کار آنلاین                 | پیش‌نویس گواهی اشتغال حرفه‌ای بسازید.                                 | اعتبار؟ مهر؟ قابل ویرایش؟                               | transactional            | ساخت گواهی            |
| قرارداد اجاره  | قرارداد اجاره       | نمونه قرارداد اجاره، اجاره نامه Word، قرارداد رهن، قرارداد PDF، بند قرارداد            | قرارداد اجاره آنلاین                       | پیش‌نویس قرارداد اجاره قابل ویرایش بسازید.                            | مشاوره حقوقی است؟ بندها؟ Word؟                          | commercial               | ساخت پیش‌نویس قرارداد |
| قرارداد کار    | قرارداد کار         | نمونه قرارداد کار، قرارداد استخدام، قرارداد Word، بندهای قرارداد، قرارداد PDF          | قرارداد کار آنلاین                         | پیش‌نویس قرارداد کار قابل ویرایش بسازید.                              | قانون کار؟ بیمه؟ قابل ویرایش؟                           | commercial               | ساخت قرارداد          |
| ویرایش فارسی   | ویرایش متن فارسی    | نیم فاصله، غلط یاب فارسی، اصلاح متن، پاکسازی متن، نرمال سازی فارسی                     | ویرایشگر متن فارسی                         | متن فارسی را در مرورگر اصلاح، پاک‌سازی و گزارش‌گیری کنید.             | متن ارسال می‌شود؟ محدودیت؟ strict چیست؟                 | informational/commercial | ویرایش متن            |

### مقالات پشتیبان و internal linking

| خوشه    | مقاله‌های پیشنهادی                                                   | لینک داخلی                       |
| ------- | -------------------------------------------------------------------- | -------------------------------- |
| فاکتور  | تفاوت فاکتور و پیش‌فاکتور؛ فاکتور رسمی چیست؛ راهنمای نوشتن رسید      | به document studio و pricing     |
| رزومه   | رزومه فارسی بهتر است یا انگلیسی؛ اشتباهات رایج رزومه؛ رزومه ATS چیست | به resume builder و cover letter |
| نامه    | ساختار نامه اداری؛ نمونه نامه درخواست؛ نامه رسمی با سربرگ            | به formal letter                 |
| قرارداد | چک‌لیست قرارداد اجاره؛ بندهای مهم قرارداد فروش؛ قرارداد کار و بیمه   | به contract tools با disclaimer  |
| ویرایش  | نیم‌فاصله چیست؛ اعداد فارسی/عربی؛ پاک‌سازی متن برای وردپرس           | به writing studio                |

## 9. Competitive Positioning

Positioning پیشنهادی:

> PersianToolbox = ابزارهای حرفه‌ای فارسی با خروجی قابل استفاده و پردازش محلی، بدون ارسال داده حساس.

| محصول        | differentiation نسبت به رقبا                                                     |
| ------------ | -------------------------------------------------------------------------------- |
| فاکتور/رسید  | خروجی حرفه‌ای فارسی + حفظ اطلاعات مشتری/فروشنده در مرورگر + خرید تکی بدون اشتراک |
| رزومه        | RTL/LTR واقعی + preview رایگان + پرداخت فقط برای خروجی clean                     |
| نامه رسمی    | قالب اداری فارسی و خروجی Word/PDF، بدون ارسال متن نامه به سرور                   |
| قرارداد      | پیش‌نویس قابل ویرایش با disclaimer شفاف، نه ادعای مشاوره حقوقی                   |
| ویرایش فارسی | تمرکز روی فارسی، نیم‌فاصله و نرمال‌سازی، نه grammar انگلیسی عمومی                |
| PDF فارسی    | حساسیت به RTL/font و privacy فایل‌ها                                             |

## 10. Validation Plan

| ایده                 | Fake door                   | Pricing test      | Eventها                                                             | Success metric                   | Kill metric         |
| -------------------- | --------------------------- | ----------------- | ------------------------------------------------------------------- | -------------------------------- | ------------------- |
| Clean invoice export | دکمه «دانلود بدون واترمارک» | 19k vs pack-3 49k | `export_click`, `upgrade_view`, `checkout_start`, `payment_success` | checkout start/export click > 8% | <2% طی 1000 session |
| Resume export        | export modal بعد از preview | 29k vs 39k        | same + `resume_complete`                                            | payment success/view > 1.5%      | <0.5%               |
| Formal letter        | CTA روی landing             | 19k               | `letter_preview`, `letter_export_click`                             | export click/preview > 10%       | <3%                 |
| Lease contract       | waitlist/pay button         | 49k               | `contract_preview`, `contract_upgrade`                              | email/pay intent > 5%            | ریسک complaint بالا |
| Writing Pro          | strict mode locked          | 99k/mo            | `strict_click`, `long_text_limit`                                   | upgrade click/limit hit > 5%     | low repeat usage    |

## 11. 90-Day Roadmap

### هفته 1 تا 2: درآمد سریع - P0

| کار                                               | خروجی                     |
| ------------------------------------------------- | ------------------------- |
| Fix subscription status contract                  | premium gate درست کار کند |
| Pack-3 را CTA اصلی کنید                           | کاهش مانع خرید            |
| Export modal یکپارچه برای business/career/writing | upgrade moment واضح       |
| Analytics funnel برای export و checkout           | داده conversion           |
| تست پرداخت sandbox و token lifecycle              | کاهش خطای درآمد           |

### هفته 3 تا 4: polish و conversion - P0/P1

| کار                               | خروجی             |
| --------------------------------- | ----------------- |
| بهبود landing فاکتور و رزومه      | transactional SEO |
| قالب premium فاکتور/رزومه         | add-on سریع       |
| email receipt و صفحه history ساده | اعتماد خرید       |
| A/B قیمت 19k vs pack-3            | قیمت بهتر         |

### ماه 2: محصول دوم پولی - P1

| کار                               | خروجی                      |
| --------------------------------- | -------------------------- |
| Formal Letter paid export         | ابزار اداری کم‌ریسک        |
| Work Certificate paid export      | ابزار HR ساده              |
| Contract lease/sale با disclaimer | درآمد بالاتر با کنترل ریسک |
| Extend export token products      | monetization یکپارچه       |

### ماه 3: scale و SEO - P1/P2

| کار                                             | خروجی                           |
| ----------------------------------------------- | ------------------------------- |
| Content clusters برای فاکتور/رزومه/نامه/قرارداد | رشد long-tail                   |
| Batch export برای فاکتور CSV                    | Pro feature واقعی               |
| Writing Pro strict/report                       | اشتراک سبک                      |
| Search Console loop                             | اولویت‌بندی بر اساس query واقعی |

## منابع داخلی مهم

- `README.md`
- `package.json`
- `lib/tools-registry.ts`
- `docs/product/roadmap-v2.md`
- `docs/product/monetization-plan-2026-06-27.md`
- `docs/product/pay-per-export-mvp.md`
- `docs/architecture/one-time-pay-per-export-rfc.md`
- `docs/architecture/export-credit-entitlements-rfc.md`
- `components/features/business-documents/`
- `components/features/career-documents/`
- `components/features/pricing/`
- `app/api/subscription/`
- `app/api/export/token/route.ts`
- `shared/hooks/useSubscriptionStatus.ts`
- `shared/hooks/useExportToken.ts`
- `lib/pricing/exportCredits.ts`
- `lib/server/credit-metering.ts`
- `lib/server/export-token.ts`

## منابع خارجی

- Smallpdf pricing: https://smallpdf.com/pricing
- iLovePDF pricing: https://www.ilovepdf.com/pricing
- Adobe Acrobat pricing: https://www.adobe.com/acrobat/pricing.html
- PDF24 tools: https://tools.pdf24.org/
- Resume.io pricing: https://resume.io/pricing
- Enhancv pricing: https://enhancv.com/pricing/
- Grammarly plans: https://www.grammarly.com/plans
- QuillBot premium: https://quillbot.com/premium
- LanguageTool premium: https://languagetool.org/premium
- PandaDoc pricing: https://www.pandadoc.com/pricing/
- Karboom: https://karboom.io/
- e-estekhdam: https://www.e-estekhdam.com/
- Danapardaz: https://danapardaz.net/
- Webzi: https://webzi.ir/
- Formafzar: https://formafzar.com/

## JSON Backlog

```json
{
  "backlog": [
    {
      "id": "p0-fix-subscription-status-contract",
      "priority": "P0",
      "title": "Fix subscription status and premium entitlement contract",
      "routes": ["/api/subscription/status", "/pricing"],
      "files": [
        "app/api/subscription/status/route.ts",
        "shared/hooks/useSubscriptionStatus.ts",
        "components/features/pricing/UpgradeModal.tsx",
        "tests"
      ],
      "acceptanceCriteria": [
        "GET /api/subscription/status returns subscription.active and subscription.planId consistently",
        "useSubscriptionStatus marks premium users correctly",
        "expired or cancelled plans are not treated as premium",
        "unit tests cover free, active subscription, credits-only and expired states"
      ],
      "analyticsEvents": ["subscription_status_loaded", "premium_gate_checked"]
    },
    {
      "id": "p0-pack-3-primary-cta",
      "priority": "P0",
      "title": "Make pack-3 export credits the primary no-subscription offer",
      "routes": ["/pricing", "/business-tools/document-studio", "/career-tools/resume-builder"],
      "files": [
        "lib/pricing/exportCredits.ts",
        "components/features/pricing/PricingContent.tsx",
        "components/features/pricing/UpgradeModal.tsx"
      ],
      "pricing": {
        "planId": "pack-3",
        "priceToman": 49000,
        "credits": 3,
        "validityDays": 30
      },
      "acceptanceCriteria": [
        "Upgrade modal highlights pack-3 before monthly subscriptions",
        "Copy explicitly says no subscription is required",
        "Checkout starts with selected pack-3",
        "Payment success increases credit balance"
      ],
      "analyticsEvents": ["upgrade_modal_view", "pack3_select", "checkout_start", "payment_success"]
    },
    {
      "id": "p0-business-clean-export",
      "priority": "P0",
      "title": "Paid clean export for invoice, proforma and receipt",
      "routes": ["/business-tools/document-studio"],
      "files": [
        "components/features/business-documents/",
        "lib/business-documents/",
        "shared/hooks/useExportToken.ts",
        "app/api/export/token/route.ts"
      ],
      "apiContract": {
        "reserve": "POST /api/export/token { product: 'business', format: 'pdf|docx', documentType: 'invoice|proforma|receipt' }",
        "confirm": "PATCH /api/export/token { token, action: 'confirm' }",
        "cancel": "PATCH /api/export/token { token, action: 'cancel' }"
      },
      "acceptanceCriteria": [
        "Free users can preview with watermark",
        "Clean PDF/DOCX requires a valid export token",
        "No invoice content is sent to the server",
        "Credit is confirmed only after successful export"
      ],
      "tests": [
        "unit: calculations and render",
        "unit: token reserve/confirm/cancel",
        "e2e: create invoice and paid export"
      ]
    },
    {
      "id": "p0-career-clean-export",
      "priority": "P0",
      "title": "Paid clean export for Persian and English resume plus cover letter",
      "routes": ["/career-tools/resume-builder"],
      "files": [
        "components/features/career-documents/",
        "lib/career-documents/",
        "shared/hooks/useExportToken.ts"
      ],
      "pricing": {
        "resumeFa": 29000,
        "resumeEn": 39000,
        "coverLetter": 19000
      },
      "acceptanceCriteria": [
        "Free preview remains usable",
        "Watermark-free PDF and DOCX require credit",
        "RTL Persian and LTR English layouts export correctly",
        "Photo/template premium gates work as expected"
      ],
      "analyticsEvents": [
        "resume_preview",
        "resume_export_click",
        "career_upgrade_view",
        "career_payment_success"
      ]
    },
    {
      "id": "p1-formal-letter-paid-export",
      "priority": "P1",
      "title": "Add paid export for formal administrative letters",
      "routes": ["/writing-tools/formal-letter"],
      "files": [
        "app/writing-tools/formal-letter/page.tsx",
        "components/features/formal-letter/",
        "lib/formal-letter/",
        "app/api/export/token/route.ts",
        "lib/server/export-token.ts"
      ],
      "schema": {
        "sender": "string",
        "receiver": "string",
        "subject": "string",
        "body": "string",
        "tone": "formal|neutral",
        "template": "classic|official",
        "signature": "optional local image"
      },
      "acceptanceCriteria": [
        "User can build and preview a Persian formal letter for free",
        "Word/PDF clean export consumes one credit",
        "Letter content stays client-side",
        "Long body and missing optional fields are handled gracefully"
      ]
    },
    {
      "id": "p1-contract-paid-export",
      "priority": "P1",
      "title": "Add paid export for lease and sale agreement drafts",
      "routes": ["/contract-tools/lease-agreement", "/contract-tools/sale-agreement"],
      "files": [
        "app/contract-tools/lease-agreement/page.tsx",
        "app/contract-tools/sale-agreement/page.tsx",
        "components/features/contract-lease/",
        "components/features/contract-sale/",
        "lib/contract-lease/",
        "lib/contract-sale/",
        "app/api/export/token/route.ts"
      ],
      "pricing": {
        "leaseAgreement": 49000,
        "saleAgreement": 49000
      },
      "acceptanceCriteria": [
        "Every preview and export includes clear legal disclaimer",
        "DOCX/PDF export is editable and watermarked only in free mode",
        "No contract content is sent to server",
        "Validation covers parties, dates, amounts and required clauses"
      ],
      "risks": [
        "legal trust risk",
        "outdated clause risk",
        "user may confuse draft with legal advice"
      ]
    },
    {
      "id": "p1-seo-transactional-landing-pages",
      "priority": "P1",
      "title": "Create or polish transactional landing pages for paid tools",
      "routes": ["/business-tools", "/career-tools", "/writing-tools", "/contract-tools"],
      "acceptanceCriteria": [
        "Each paid tool has one primary keyword and one conversion CTA",
        "FAQ schema answers privacy, export, pricing and validity questions",
        "Internal links connect articles to tool pages and pricing",
        "No page claims legal or tax certainty without citation"
      ],
      "analyticsEvents": ["landing_cta_click", "pricing_cta_click", "faq_expand"]
    }
  ]
}
```
