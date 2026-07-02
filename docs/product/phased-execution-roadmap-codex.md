# نقشه راه اجرایی فازبندی‌شده PersianToolbox

تاریخ تدوین: 2026-06-29  
آخرین بروزرسانی: 2026-07-02
ورودی‌ها:

- گزارش Codex: `deep-research-report-codex.md`
- گزارش GPT: `/home/dev13/Downloads/deep-research-report-gpt.md`
- وضعیت فعلی ریپو روی commit: `b8ac1438 feat: wire up 5 new professional tools`

هدف این سند: تبدیل دو گزارش و تغییرات اخیر ریپو به یک نقشه راه اجرایی، فازبندی‌شده و بدون زمان‌بندی. تمرکز روی درآمد واقعی، fit فنی، privacy-first/local-first و کاهش ریسک حقوقی/پرداخت است.

## وضعیت production بعد از deploy رشد صفحه اصلی

در 2026-07-02، commit `98512d4b` روی production مستقر و زنده تست شد.

نتیجه عملیاتی:

- پیام رایگان بودن در homepage و SEO با شمارش تاییدشده «۸۶ ابزار رایگان» یکسان شد.
- بخش «مسیر پیشنهادی برای هر نوع کاربر» به homepage اضافه شد تا کاربرهای مالی/اداری، کسب‌وکار، PDF/فایل و نویسنده/دانشجو سریع‌تر به ابزار برسند.
- QA کامل قبل از deploy پاس شد: typecheck، lint، 1,234 تست Vitest و build با 825 صفحه.
- health زنده، 10 صفحه کلیدی، CSS و فونت production همگی پاس شدند.

اثر روی این roadmap: مسیر جذب کاربر رایگان بهتر شده است؛ اولویت بعدی باید اندازه‌گیری funnel همین مسیرها و سپس اتصال دقیق‌تر export/premium به محصولات پولی باشد.

## جمع‌بندی تصمیم

مسیر درست از اینجا «ساخت ابزارهای بیشتر» نیست. commit اخیر ۵ ابزار حرفه‌ای جدید اضافه کرده است:

| ابزار           | مسیر                                | وضعیت محصول                                       | وضعیت درآمدزایی                         |
| --------------- | ----------------------------------- | ------------------------------------------------- | --------------------------------------- |
| قرارداد کار     | `/career-tools/employment-contract` | فرم، render، export، draft، test دارد             | ناقص؛ به product عمومی `career` وصل شده |
| گواهی سابقه کار | `/career-tools/work-certificate`    | فرم، template، render، export، draft، test دارد   | ناقص؛ به product عمومی `career` وصل شده |
| اجاره‌نامه      | `/contract-tools/lease-agreement`   | فرم، clauses، render، export، draft، test دارد    | ناقص؛ به product عمومی `career` وصل شده |
| مبایعه‌نامه     | `/contract-tools/sale-agreement`    | فرم، clauses، render، export، draft، test دارد    | ناقص؛ به product عمومی `career` وصل شده |
| نامه اداری      | `/writing-tools/formal-letter`      | فرم، paragraphs، render، export، draft، test دارد | ناقص؛ به product عمومی `career` وصل شده |

این commit «مرده» به معنی بی‌ارزش نیست؛ از نظر product surface زنده است. اما از نظر monetization هنوز production-ready نیست، چون:

- `app/api/export/token/route.ts` فقط `business | career | writing` را قبول می‌کند.
- `shared/hooks/useExportToken.ts` هم فقط همین سه product را تایپ کرده است.
- ابزارهای جدید همگی `requestToken('career')` و `UpgradeModal product="career"` دارند؛ بنابراین attribution، pricing، analytics، copy و credit metering برای قرارداد/نامه/گواهی دقیق نیست.
- `shared/hooks/useSubscriptionStatus.ts` از `data.subscription?.active` و `data.subscription?.planId` استفاده می‌کند، اما `app/api/subscription/status/route.ts` آبجکتی با `id`, `title`, `tier`, `expiresAt` برمی‌گرداند. نتیجه محتمل: کاربر premium ممکن است premium تشخیص داده نشود.
- گزارش GPT در چند جا پیشنهاد APIهای document-content server-side مثل `/api/invoice/create` و جدول `Invoice/Resume` می‌دهد که با اصل local-first و معماری export-token فعلی هم‌خوان نیست. این پیشنهادها نباید مبنا قرار بگیرند مگر برای V2 اختیاری و با حفظ privacy.

بنابراین اولویت اجرایی:

1. اصلاح entitlement و premium detection.
2. تبدیل ابزارهای ساخته‌شده به محصولات قابل فروش با product IDs دقیق.
3. یکپارچه‌سازی pay-per-export و credit lifecycle.
4. بهینه‌سازی صفحات و CTAها برای خرید تکی.
5. بعد از درآمد اولیه، اضافه کردن batch، template add-on، business profile و Writing Pro.

## اصول غیرقابل مذاکره

| اصل                              | تصمیم اجرایی                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| ابزار پایه رایگان می‌ماند        | کاربر باید فرم، preview و خروجی واترمارک‌دار را قبل از پرداخت ببیند                   |
| محتوای سند به سرور نمی‌رود       | سرور فقط payment، entitlement، credit و export token را می‌بیند                       |
| خرید تکی مقدم بر اشتراک است      | `pack-3` و credit/export مدل primary هستند                                            |
| paywall بعد از value ظاهر می‌شود | modal فقط هنگام clean PDF/DOCX، template locked، clause locked یا limit hit           |
| قوانین و حقوق حساس‌اند           | قراردادها و گواهی‌ها disclaimer دائمی و واضح دارند                                    |
| DB-heavy عقب می‌افتد             | history server-side، invoice DB، resume DB و team features وارد فازهای اولیه نمی‌شوند |

## محصولاتی که باید بفروشیم

| رتبه | محصول پولی                         | وضعیت ریپو           | مدل درآمدی              | قیمت پایه پیشنهادی | اولویت |
| ---: | ---------------------------------- | -------------------- | ----------------------- | -----------------: | ------ |
|    1 | بسته ۳ خروجی حرفه‌ای               | موجود در pricing     | خرید تکی credit         |             49,000 | P0     |
|    2 | خروجی تمیز فاکتور/رسید/پیش‌فاکتور  | محصول flagship موجود | ۱ credit/export         |   19,000 یا credit | P0     |
|    3 | خروجی تمیز رزومه/کاورلتر           | محصول flagship موجود | ۱ credit/export         |   29,000 تا 39,000 | P0     |
|    4 | نامه اداری حرفه‌ای                 | commit جدید دارد     | ۱ credit/export         |             19,000 | P0     |
|    5 | گواهی سابقه کار                    | commit جدید دارد     | ۱ credit/export         |             19,000 | P1     |
|    6 | قرارداد اجاره                      | commit جدید دارد     | ۲ credit یا قیمت بالاتر |             49,000 | P1     |
|    7 | مبایعه‌نامه                        | commit جدید دارد     | ۲ credit یا قیمت بالاتر |             49,000 | P1     |
|    8 | قرارداد کار                        | commit جدید دارد     | ۲ credit یا قیمت بالاتر |             49,000 | P1     |
|    9 | قالب‌های premium فاکتور/رزومه/نامه | schema برخی موجود    | add-on یا premium gate  |             39,000 | P1     |
|   10 | Writing Pro                        | محصول flagship موجود | اشتراک سبک              |       99,000/month | P2     |

## فاز 0: تثبیت درآمد و entitlement

هدف: قبل از فروش بیشتر، مسیر premium، credit، payment و export قابل اعتماد شود.

### کارهای اجرایی

| کار                                             | فایل‌ها                                                                                         | خروجی قابل پذیرش                                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| اصلاح contract وضعیت اشتراک                     | `app/api/subscription/status/route.ts`, `shared/hooks/useSubscriptionStatus.ts`                 | API و hook روی `active`, `planId`, `expiresAt`, `tier` توافق داشته باشند                                |
| اضافه کردن تست response shape اشتراک            | `tests/unit` یا تست API موجود                                                                   | free، logged-out، active، expired پوشش داده شود                                                         |
| استاندارد کردن product IDs برای export          | `lib/server/export-token.ts`, `app/api/export/token/route.ts`, `shared/hooks/useExportToken.ts` | product type شامل محصولات جدید باشد                                                                     |
| جلوگیری از مصرف credit برای export واترمارک‌دار | فرم‌های سند                                                                                     | free export بدون token، clean export با token                                                           |
| افزودن analytics پایه برای funnel               | export modal، checkout، token API                                                               | eventهای `export_click`, `upgrade_view`, `checkout_start`, `payment_success`, `export_confirm` ثبت شوند |
| مشخص کردن fallback خطا                          | hooks/forms                                                                                     | token failure، cancel reservation، retry window و پرداخت ناموفق پیام فارسی روشن داشته باشند             |

### Product IDs پیشنهادی

```ts
type ExportProduct =
  | 'business'
  | 'career'
  | 'writing'
  | 'formal-letter'
  | 'work-certificate'
  | 'employment-contract'
  | 'lease-agreement'
  | 'sale-agreement';
```

برای گزارش‌گیری درآمد، ابزارهای جدید نباید زیر `career` پنهان شوند. اگر abstraction لازم است، گروه محصول جداگانه بسازید:

```ts
type ExportProductGroup = 'business' | 'career' | 'writing' | 'legal' | 'administrative';
```

اما transaction باید product دقیق داشته باشد.

### معیار پایان فاز

- premium کاربر بعد از خرید واقعاً در UI فعال می‌شود.
- هر clean export یک reservation دارد و بعد از موفقیت confirm می‌شود.
- هر شکست export reservation را cancel می‌کند یا retry window شفاف دارد.
- هیچ متن، فاکتور، رزومه، نامه یا قرارداد به API export-token ارسال نمی‌شود.

## فاز 1: درآمد سریع از محصولات موجود

هدف: روی ابزارهایی که از قبل matureتر هستند درآمد بگیرید، نه روی ابزارهای حقوقی پرریسک.

### Scope

| محصول                       | اقدام                                       | دلیل                                            |
| --------------------------- | ------------------------------------------- | ----------------------------------------------- |
| فاکتور/پیش‌فاکتور/رسید      | clean PDF/DOCX را پشت credit بگذارید        | نیاز تجاری مستقیم و ریسک حقوقی پایین            |
| رزومه فارسی/انگلیسی/کاورلتر | clean PDF/DOCX و قالب‌های بهتر را پولی کنید | willingness بالاتر و محصول flagship             |
| بسته ۳ خروجی                | CTA اصلی modal و pricing باشد               | کمترین friction برای خرید                       |
| Pricing page                | پیام «بدون اشتراک ماهانه» را برجسته کند     | گزارش‌ها هر دو خرید تکی را بهترین شروع می‌دانند |

### تغییرات لازم

| حوزه            | فایل‌ها                                                                                              | کار                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Business export | `components/features/business-documents/DocumentStudio.tsx`, `lib/business-documents/export.ts`      | دکمه‌های export، modal، confirm/cancel را با UX نهایی کنید   |
| Career export   | `components/features/career-documents/CareerWizard.tsx`, `lib/career-documents/export.ts`            | رزومه فارسی/انگلیسی و کاورلتر را با قیمت/copy جدا نمایش دهید |
| Pricing         | `components/features/pricing/PricingContent.tsx`, `UpgradeModal.tsx`, `lib/pricing/exportCredits.ts` | `pack-3` primary، اشتراک secondary                           |
| Copy            | landingها و modalها                                                                                  | تأکید: preview رایگان، دانلود clean پولی                     |
| Tests           | unit + E2E                                                                                           | مسیر ساخت سند تا export پولی پوشش داده شود                   |

### Acceptance Criteria

- کاربر بدون پرداخت preview کامل می‌بیند.
- کلیک روی دانلود clean برای کاربر بدون credit، modal خرید نشان می‌دهد.
- بعد از خرید، همان flow بدون refresh سنگین یا سردرگمی ادامه پیدا می‌کند یا CTA برگشت روشن دارد.
- خروجی free واترمارک دارد؛ خروجی paid ندارد.
- قیمت و credit در modal با `lib/pricing/exportCredits.ts` یکی است.

## فاز 2: قابل فروش کردن ۵ ابزار commit اخیر

هدف: commit جدید را از «ابزارهای اضافه‌شده» به «محصولات پولی قابل اندازه‌گیری» تبدیل کنید.

### اولویت‌بندی ابزارهای جدید

| اولویت | ابزار           | چرا                                                            |
| ------ | --------------- | -------------------------------------------------------------- |
| P0     | نامه اداری      | کم‌ریسک، عمومی، قیمت پایین، مناسب credit 1                     |
| P1     | گواهی سابقه کار | نیاز مشخص، کم‌ریسک‌تر از قرارداد، مناسب HR/کارمند              |
| P1     | اجاره‌نامه      | ارزش خروجی بالا، اما ریسک حقوقی و اعتماد بالاتر                |
| P1     | قرارداد کار     | ارزش بالا، اما وابسته به قانون کار و copy حقوقی                |
| P2     | مبایعه‌نامه     | ریسک حقوقی و مالی بالاتر؛ بعد از کنترل disclaimer و اعتبارسنجی |

### اصلاحات مشترک برای هر ۵ ابزار

| مشکل فعلی                                         | اقدام                                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| همه به `career` وصل شده‌اند                       | هر ابزار product ID خودش را در `requestToken()` و `UpgradeModal` بگیرد           |
| modal فقط labelهای فاکتور/رزومه/ویرایشگر دارد     | `UpgradeModal` باید product config داشته باشد: label، price hint، risk copy، CTA |
| قیمت contract با نامه یکی نیست                    | `creditCost` یا product pricing layer اضافه شود                                  |
| تست‌ها بیشتر render/schema هستند                  | تست monetization flow اضافه شود                                                  |
| صفحات ساخته شده‌اند ولی conversion copy کافی نیست | landing/page copy باید «پیش‌نمایش رایگان، خروجی Word/PDF حرفه‌ای» را صریح کند    |

### Product Config پیشنهادی

```ts
type ProductMonetizationConfig = {
  id: ExportProduct;
  label: string;
  group: 'business' | 'career' | 'writing' | 'legal' | 'administrative';
  cleanExportCredits: 1 | 2;
  primaryFormat: 'pdf' | 'docx';
  paidTrigger: 'clean-export' | 'template-unlock' | 'clause-unlock' | 'length-limit';
  legalDisclaimerRequired: boolean;
};
```

### Acceptance Criteria

- `formal-letter` با ۱ credit clean export می‌دهد.
- `work-certificate` با ۱ credit clean export می‌دهد.
- `lease-agreement`, `sale-agreement`, `employment-contract` یا ۲ credit مصرف می‌کنند یا modal قیمت بالاتر را شفاف نشان می‌دهد.
- transactionها در DB با product دقیق ثبت می‌شوند.
- disclaimer در preview و export قراردادها حذف‌شدنی نیست.
- محتوای سند همچنان client-side می‌ماند.

## فاز 3: SEO و Conversion برای ابزارهای پولی

هدف: صفحات ابزارهای پولی traffic را به ساخت سند و سپس export پولی تبدیل کنند.

### صفحات P0/P1

| صفحه                                | keyword اصلی        | CTA اصلی           | CTA secondary           |
| ----------------------------------- | ------------------- | ------------------ | ----------------------- |
| `/business-tools/document-studio`   | فاکتورساز آنلاین    | ساخت فاکتور رایگان | دانلود بدون واترمارک    |
| `/career-tools/resume-builder`      | رزومه ساز فارسی     | ساخت رزومه رایگان  | دانلود PDF/Word حرفه‌ای |
| `/writing-tools/formal-letter`      | نامه اداری آماده    | ساخت نامه رسمی     | دانلود Word/PDF         |
| `/career-tools/work-certificate`    | گواهی اشتغال به کار | ساخت گواهی         | دانلود نسخه رسمی        |
| `/contract-tools/lease-agreement`   | قرارداد اجاره       | ساخت پیش‌نویس      | دانلود Word قابل ویرایش |
| `/contract-tools/sale-agreement`    | مبایعه نامه         | ساخت پیش‌نویس      | دانلود Word قابل ویرایش |
| `/career-tools/employment-contract` | قرارداد کار         | ساخت قرارداد       | دانلود نسخه کامل        |

### کارهای اجرایی

| کار                           | فایل‌ها                                      | خروجی                             |
| ----------------------------- | -------------------------------------------- | --------------------------------- |
| بهینه‌سازی title/meta/FAQ     | page files + registry                        | intent transactional واضح         |
| لینک داخلی از blog و category | `lib/tools-registry.ts`, صفحات category/blog | مسیر SEO به ابزار پولی            |
| FAQ privacy                   | همه صفحات پولی                               | پاسخ: «اطلاعات شما ارسال نمی‌شود» |
| FAQ pricing                   | همه صفحات پولی                               | تفاوت رایگان و حرفه‌ای            |
| CTA بعد از preview            | component forms                              | upgrade بعد از value              |

### معیار پایان فاز

- هر صفحه پولی یک keyword اصلی و یک CTA اصلی دارد.
- FAQ schema به privacy، خروجی، واترمارک و اعتبار سند پاسخ می‌دهد.
- مسیر کاربر از landing به form و از preview به export روشن است.

## فاز 4: Add-on و بسته‌های درآمد افزایشی

هدف: بعد از فروش خروجی، Average Order Value و تکرار خرید را بالا ببرید.

### Add-onها

| Add-on                   | محصول مرتبط         | مدل                        | اولویت |
| ------------------------ | ------------------- | -------------------------- | ------ |
| قالب premium فاکتور      | Business            | unlock با credit یا add-on | P1     |
| قالب premium رزومه       | Career              | add-on                     | P1     |
| سربرگ/مهر/لوگو ذخیره‌شده | Business/Admin docs | business profile           | P1     |
| clause premium           | قراردادها           | credit یا unlock           | P1     |
| paragraphs premium       | نامه اداری          | credit یا unlock           | P2     |
| batch invoice از CSV     | Business            | Pro یا credit pack         | P2     |

### تصمیم فنی

- add-onها نباید در ابتدا DB سنگین بخواهند.
- template unlock می‌تواند با entitlement/plan/credit کنترل شود.
- business profile اگر server-side شد، فقط metadata کسب‌وکار را با رضایت کاربر ذخیره کند، نه محتوای فاکتورها.

## فاز 5: Writing Pro و Batch Tools

هدف: محصول اشتراکی سبک بسازید که با local-first سازگار باشد.

### Writing Pro Scope

| Feature | Free          | Pro                 |
| ------- | ------------- | ------------------- |
| طول متن | 5000 کاراکتر  | بیشتر/نامحدود منطقی |
| mode    | safe/standard | strict              |
| report  | آمار ساده     | گزارش کیفیت متن     |
| batch   | ندارد         | چند فایل متنی       |
| privacy | local         | local               |

### کارهای اجرایی

| کار                            | فایل‌ها                                                  |
| ------------------------------ | -------------------------------------------------------- |
| premium gate واقعی strict mode | `lib/persian-writing/types.ts`, writing studio component |
| limit hit modal                | writing component + `UpgradeModal`                       |
| export report PDF              | writing export module جدید                               |
| batch cleanup local            | client-side parser و queue                               |

### معیار پایان فاز

- کاربر free ارزش واقعی دریافت می‌کند.
- upgrade فقط برای متن بلند، strict، report یا batch ظاهر می‌شود.
- هیچ متن خامی برای subscription check یا AI به سرور نمی‌رود.

## فاز 6: ابزارهای مالی/حقوق و دستمزد فقط بعد از اعتبارسنجی

هدف: از ساخت زودهنگام ابزارهای قانونی/مالی پرریسک جلوگیری شود.

### Candidateها

| ابزار              | وضعیت                    | شرط ورود به اجرا                          |
| ------------------ | ------------------------ | ----------------------------------------- |
| فیش حقوقی          | جذاب ولی حساس            | source قانونی، تست محاسبات، disclaimer    |
| گزارش مالی ساده    | قابل فروش اما scope بزرگ | حداقل ۵٪ fake-door click از ابزارهای مالی |
| خسارت تأخیر تأدیه  | SEO خوب ولی حقوقی        | citation رسمی شاخص‌ها و متن مسئولیت       |
| مالیات ارزش افزوده | ساده‌تر                  | نرخ‌های رسمی و تاریخ اعتبار               |

### تصمیم

این فاز نباید قبل از کامل شدن فازهای 0 تا 3 شروع شود، مگر داده واقعی Search Console/Analytics نشان دهد queryهای مالی intent خرید بالاتری از سندهای فعلی دارند.

## فاز 7: AI Assist اختیاری و کنترل‌شده

هدف: فقط وقتی credit revenue و privacy messaging تثبیت شد، AI را add-on کنید.

### قواعد

| قاعده             | اجرا                                                |
| ----------------- | --------------------------------------------------- |
| opt-in صریح       | کاربر باید بداند متن ارسال می‌شود                   |
| redaction پیش‌فرض | نام، شماره، آدرس، مبلغ حساس تا حد ممکن حذف/ماسک شود |
| cost cap          | هر درخواست AI credit جدا یا سقف روزانه داشته باشد   |
| fallback local    | ابزار بدون AI همچنان کامل کار کند                   |

### Candidateهای AI

- پیشنهاد متن کاورلتر.
- بازنویسی خلاصه رزومه.
- پیشنهاد لحن نامه اداری.
- توضیح بند قرارداد به زبان ساده، نه تولید مشاوره حقوقی.

## Backlog اجرایی اولویت‌دار

| ID    | اولویت | عنوان                            | نوع کار          | فایل‌های اصلی                                                                                   | معیار پذیرش                                            |
| ----- | ------ | -------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| R0-01 | P0     | Fix subscription status contract | backend/frontend | `app/api/subscription/status/route.ts`, `shared/hooks/useSubscriptionStatus.ts`                 | premium user در همه فرم‌ها premium دیده شود            |
| R0-02 | P0     | Export product taxonomy          | backend/shared   | `lib/server/export-token.ts`, `app/api/export/token/route.ts`, `shared/hooks/useExportToken.ts` | productهای جدید typed و پذیرفته شوند                   |
| R0-03 | P0     | Product-aware UpgradeModal       | frontend         | `components/features/pricing/UpgradeModal.tsx`                                                  | label، CTA، risk copy برای هر product درست باشد        |
| R0-04 | P0     | Analytics funnel for paid export | frontend/backend | export forms، token API، checkout                                                               | eventهای funnel ثبت شوند                               |
| R1-01 | P0     | Business clean export polish     | frontend/export  | `components/features/business-documents/`, `lib/business-documents/`                            | PDF/DOCX clean با credit معتبر                         |
| R1-02 | P0     | Career clean export polish       | frontend/export  | `components/features/career-documents/`, `lib/career-documents/`                                | resume/cover letter paid export کامل                   |
| R1-03 | P0     | Pricing page pack-3 focus        | frontend/copy    | `components/features/pricing/PricingContent.tsx`                                                | pack-3 primary و بدون اشتراک واضح                      |
| R2-01 | P0     | Formal letter monetization       | frontend/export  | `components/features/formal-letter/`, `lib/formal-letter/`                                      | product `formal-letter`، ۱ credit، clean export        |
| R2-02 | P1     | Work certificate monetization    | frontend/export  | `components/features/work-certificate/`, `lib/work-certificate/`                                | product `work-certificate`، ۱ credit                   |
| R2-03 | P1     | Lease agreement monetization     | frontend/export  | `components/features/contract-lease/`, `lib/contract-lease/`                                    | product `lease-agreement`، disclaimer، credit cost     |
| R2-04 | P1     | Employment contract monetization | frontend/export  | `components/features/business-employment/`, `lib/business-employment/`                          | product `employment-contract`، disclaimer، credit cost |
| R2-05 | P2     | Sale agreement monetization      | frontend/export  | `components/features/contract-sale/`, `lib/contract-sale/`                                      | product `sale-agreement`، disclaimer، credit cost      |
| R3-01 | P1     | Transactional SEO pages          | SEO/frontend     | page files، `lib/tools-registry.ts`                                                             | CTA و FAQ و keyword برای صفحات پولی                    |
| R4-01 | P1     | Premium templates                | frontend/export  | schemas/render modules                                                                          | قالب locked و unlock در paid mode                      |
| R4-02 | P2     | Business profile local-first     | frontend/storage | business docs، admin docs                                                                       | metadata ذخیره شود، سند ذخیره نشود                     |
| R5-01 | P2     | Writing Pro strict gate          | frontend/lib     | writing studio، `lib/persian-writing/`                                                          | strict mode paid و free واقعی                          |

## Backlog JSON برای agent کدنویس

```json
{
  "roadmap": {
    "principles": [
      "local-first/privacy-first",
      "free preview before paid export",
      "single-purchase and credit model before subscription",
      "no document content sent to server",
      "legal disclaimers required for contracts and certificates"
    ],
    "phases": [
      {
        "id": "phase-0-entitlement-foundation",
        "name": "تثبیت entitlement و credit export",
        "priority": "P0",
        "goal": "پرداخت، premium detection و export token قابل اعتماد شود.",
        "tasks": [
          {
            "id": "R0-01",
            "title": "Fix subscription status contract",
            "files": [
              "app/api/subscription/status/route.ts",
              "shared/hooks/useSubscriptionStatus.ts"
            ],
            "acceptanceCriteria": [
              "API returns subscription.active, subscription.planId, subscription.tier and subscription.expiresAt consistently",
              "Hook detects active premium users correctly",
              "Expired or missing subscriptions remain free"
            ]
          },
          {
            "id": "R0-02",
            "title": "Add exact export product IDs",
            "files": [
              "lib/server/export-token.ts",
              "app/api/export/token/route.ts",
              "shared/hooks/useExportToken.ts"
            ],
            "productIds": [
              "business",
              "career",
              "writing",
              "formal-letter",
              "work-certificate",
              "employment-contract",
              "lease-agreement",
              "sale-agreement"
            ],
            "acceptanceCriteria": [
              "New products are accepted by /api/export/token",
              "Transactions store exact product IDs",
              "No document body is sent to token API"
            ]
          },
          {
            "id": "R0-03",
            "title": "Make UpgradeModal product-aware",
            "files": [
              "components/features/pricing/UpgradeModal.tsx",
              "lib/pricing/exportCredits.ts"
            ],
            "acceptanceCriteria": [
              "Modal shows correct product label",
              "Pack-3 is primary CTA",
              "Legal products show risk/disclaimer copy",
              "Basic subscription remains secondary"
            ]
          }
        ]
      },
      {
        "id": "phase-1-existing-flagship-revenue",
        "name": "درآمد از flagshipهای موجود",
        "priority": "P0",
        "goal": "فاکتور و رزومه را به مسیر فروش clean export تبدیل کند.",
        "tasks": [
          {
            "id": "R1-01",
            "title": "Business document clean export",
            "routes": ["/business-tools/document-studio"],
            "files": [
              "components/features/business-documents/",
              "lib/business-documents/",
              "shared/hooks/useExportToken.ts"
            ],
            "acceptanceCriteria": [
              "Free preview and watermarked export work",
              "Clean PDF/DOCX consumes credit",
              "Reservation is confirmed after successful export and cancelled on failure"
            ]
          },
          {
            "id": "R1-02",
            "title": "Career document clean export",
            "routes": ["/career-tools/resume-builder"],
            "files": ["components/features/career-documents/", "lib/career-documents/"],
            "acceptanceCriteria": [
              "Persian and English resume exports work",
              "Cover letter export works if available in current wizard",
              "Premium templates and clean output are gated after preview"
            ]
          },
          {
            "id": "R1-03",
            "title": "Pack-3 primary pricing",
            "routes": ["/pricing"],
            "files": [
              "components/features/pricing/PricingContent.tsx",
              "components/features/pricing/UpgradeModal.tsx"
            ],
            "acceptanceCriteria": [
              "Pack-3 is visually primary for export use cases",
              "Copy states no monthly subscription is required",
              "Checkout creates correct plan request"
            ]
          }
        ]
      },
      {
        "id": "phase-2-monetize-new-professional-tools",
        "name": "فروش‌پذیر کردن ۵ ابزار commit اخیر",
        "priority": "P0-P2",
        "goal": "ابزارهای جدید با product ID دقیق، credit cost و copy درست قابل فروش شوند.",
        "tasks": [
          {
            "id": "R2-01",
            "title": "Formal letter paid export",
            "priority": "P0",
            "route": "/writing-tools/formal-letter",
            "files": [
              "components/features/formal-letter/FormalLetterForm.tsx",
              "lib/formal-letter/"
            ],
            "productId": "formal-letter",
            "creditCost": 1,
            "acceptanceCriteria": [
              "requestToken uses formal-letter",
              "UpgradeModal uses formal-letter",
              "Clean PDF/DOCX requires credit",
              "Free preview remains usable"
            ]
          },
          {
            "id": "R2-02",
            "title": "Work certificate paid export",
            "priority": "P1",
            "route": "/career-tools/work-certificate",
            "files": [
              "components/features/work-certificate/WorkCertificateForm.tsx",
              "lib/work-certificate/"
            ],
            "productId": "work-certificate",
            "creditCost": 1,
            "acceptanceCriteria": [
              "requestToken uses work-certificate",
              "Certificate disclaimer remains visible",
              "Premium templates require paid entitlement"
            ]
          },
          {
            "id": "R2-03",
            "title": "Lease agreement paid export",
            "priority": "P1",
            "route": "/contract-tools/lease-agreement",
            "files": [
              "components/features/contract-lease/LeaseAgreementForm.tsx",
              "lib/contract-lease/"
            ],
            "productId": "lease-agreement",
            "creditCost": 2,
            "acceptanceCriteria": [
              "requestToken uses lease-agreement",
              "Legal disclaimer is non-removable",
              "Premium clauses are paid",
              "DOCX remains editable"
            ]
          },
          {
            "id": "R2-04",
            "title": "Employment contract paid export",
            "priority": "P1",
            "route": "/career-tools/employment-contract",
            "files": [
              "components/features/business-employment/EmploymentContractForm.tsx",
              "lib/business-employment/"
            ],
            "productId": "employment-contract",
            "creditCost": 2,
            "acceptanceCriteria": [
              "requestToken uses employment-contract",
              "Legal disclaimer is non-removable",
              "Premium clauses are paid"
            ]
          },
          {
            "id": "R2-05",
            "title": "Sale agreement paid export",
            "priority": "P2",
            "route": "/contract-tools/sale-agreement",
            "files": [
              "components/features/contract-sale/SaleAgreementForm.tsx",
              "lib/contract-sale/"
            ],
            "productId": "sale-agreement",
            "creditCost": 2,
            "acceptanceCriteria": [
              "requestToken uses sale-agreement",
              "Legal disclaimer is non-removable",
              "High-risk copy is shown before paid export"
            ]
          }
        ]
      },
      {
        "id": "phase-3-seo-conversion",
        "name": "SEO و conversion برای صفحات پولی",
        "priority": "P1",
        "goal": "هر ابزار پولی صفحه، CTA و FAQ مناسب intent خرید داشته باشد.",
        "tasks": [
          {
            "id": "R3-01",
            "title": "Polish transactional metadata and FAQ",
            "files": [
              "app/business-tools/",
              "app/career-tools/",
              "app/contract-tools/",
              "app/writing-tools/",
              "lib/tools-registry.ts"
            ],
            "acceptanceCriteria": [
              "Each paid tool has one primary keyword",
              "FAQ covers privacy, pricing, watermark and output format",
              "Internal links point to tool and pricing pages"
            ]
          }
        ]
      },
      {
        "id": "phase-4-aov-addons",
        "name": "افزایش AOV با add-onها",
        "priority": "P1-P2",
        "goal": "بعد از فروش خروجی، قالب، profile و batch اضافه شود.",
        "tasks": [
          {
            "id": "R4-01",
            "title": "Premium templates and clauses",
            "acceptanceCriteria": [
              "Locked templates are visible after preview",
              "Upgrade trigger is clear",
              "Unlock does not require sending document content to server"
            ]
          },
          {
            "id": "R4-02",
            "title": "Business profile metadata",
            "acceptanceCriteria": [
              "Logo and business metadata can be reused",
              "Document bodies are not stored server-side by default"
            ]
          }
        ]
      },
      {
        "id": "phase-5-writing-pro",
        "name": "Writing Pro و batch local tools",
        "priority": "P2",
        "goal": "اشتراک سبک برای متن بلند، strict mode، report و batch ساخته شود.",
        "tasks": [
          {
            "id": "R5-01",
            "title": "Writing Pro strict and report gates",
            "files": [
              "lib/persian-writing/",
              "app/writing-tools/persian-writing-studio/",
              "components/features/"
            ],
            "acceptanceCriteria": [
              "Free mode remains useful",
              "Strict mode and long text gates show upgrade modal",
              "Text processing remains local"
            ]
          }
        ]
      }
    ]
  }
}
```

## کارهایی که فعلاً نباید انجام شوند

| کار                                                                 | دلیل توقف                                                       |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| mobile app                                                          | درآمد اولیه را جلو نمی‌اندازد                                   |
| white-label API                                                     | با privacy-first و stage فعلی mismatch دارد                     |
| enterprise/team feature                                             | فروش و support سنگین می‌خواهد                                   |
| affiliate program                                                   | قبل از conversion واقعی زود است                                 |
| ذخیره کامل فاکتور/رزومه/قرارداد در DB                               | خلاف مسیر local-first و افزایش ریسک privacy                     |
| APIهای `/api/invoice/create` و `/api/resume/create` برای محتوای سند | با معماری export-token فعلی ناسازگار است مگر V2 opt-in          |
| ابزارهای حقوق و دستمزد کامل                                         | قوانین متغیر و ریسک اعتماد بالا؛ نیازمند citation و تست محاسبات |

## نتیجه نهایی

PersianToolbox اکنون به اندازه کافی ابزار حرفه‌ای دارد. گلوگاه اصلی دیگر ایده نیست؛ گلوگاه «قابل فروش، قابل اندازه‌گیری و قابل اعتماد کردن خروجی‌ها» است.

ترتیب اجرا باید این باشد:

1. entitlement و premium bug را درست کنید.
2. product taxonomy export را دقیق کنید.
3. فاکتور و رزومه را با `pack-3` بفروشید.
4. نامه اداری و گواهی سابقه کار را سریع به credit وصل کنید.
5. قراردادها را با disclaimer، credit cost بالاتر و analytics دقیق وارد فروش کنید.
6. بعد از داده واقعی، add-on، batch و Writing Pro را اضافه کنید.
