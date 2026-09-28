# پرامپت‌های اجرایی Codex — 2026-09-28

این فایل را در Codex CLI حساب مالک با launcher `c2` باز کن. اجرای همه تسک‌ها یک‌جا یا شروع agent-loop خواسته نشده است. یک تسک مستقل تا خروجی قابل‌بازبینی انجام شود؛ سپس وضعیت ثبت شود.

## پیش‌نیاز نشست c2

در 2026-09-28 حساب ۲ فعال شد ولی Codex با خطای احراز هویت و refresh token متوقف شد؛ بازبینی آن اجرا نشد. پیش از اجرای این پرامپت‌ها، مالک باید در همان حساب دوباره وارد شود. بدون اجازه به حساب دیگری تغییر نده و token را در گزارش نگذار. این مانع، آماده‌بودن اسناد را تغییر نمی‌دهد.

## پرامپت شروع

```text
در repo اصلی alirezasafaei-dev/persiantoolbox کار کن.
AGENTS.md، docs/HANDOFF.md و این بسته را بخوان:
docs/growth/seo-geo-2026-09-28/{EVIDENCE,ROADMAP,TASKS,PROMPTS}.md
git status/log/diff و remote و PRهای باز را بررسی کن. checkout dirty مالک را تغییر نده.
برای تسک انتخاب‌شده worktree مستقل بساز یا همان worktree صحیح را ادامه بده.
فقط TASK_ID انتخاب‌شده و معیار پذیرش آن را اجرا کن؛ کار انجام‌شده را تکرار نکن.
scope مجاز: read-only audit، تغییر محدود محلی، تست، Signed-off-by، push و PR مستقل.
merge، deploy، rollback، workflow dispatch، تغییر سرور/GSC/سیاست training مجاز نیست.
کلید و raw GSC خارج Git؛ داده خصوصی یا token را چاپ نکن.
داده ۲۶ سپتامبر، دریافت امروز نیست؛ هر refresh زمان و latest final day خودش را دارد.
اگر یک بخش blocked بود، بخش مستقل مجاز را انجام بده و blocker دقیق بنویس.
گزارش خروجی را در مسیر تعیین‌شده TASKS.md ذخیره کن و وضعیت همان ردیف را به‌روز کن.
شواهد تاریخی CI یا آزمون را به SHA فعلی نسبت نده. PASS/FAIL/NOT_RUN دقیق.
```

## پرامپت انتخاب هر تسک

هر قطعه با پرامپت شروع بالا استفاده شود.

### SG28-00

```text
TASK_ID=SG28-00. هدف: دریافت واقعی آخرین Search Console final data.
از کلید موجود خارج repo و webmasters.readonly استفاده کن؛ خطای 403 قبلی را
با probe کوتاه و خطای redacted بررسی کن. مجوز یا تنظیمات حساب را تغییر نده.
دو بازهٔ ۲۸روزه کامل، main-host و domain جدا، pagination و provenance لازم است.
raw export خصوصی؛ فقط خلاصهٔ عمومی و hash در گزارش. در شکست، refresh را BLOCKED نگه دار.
```

### SG28-01

```text
TASK_ID=SG28-01. افت ابزار address-fa-to-en اولویت دارد:
518→392 کلیک در آخرین snapshot؛ مجموع بقیه صفحات 282→349.
query/device/country/daily و شواهد فنی را تفکیک کن؛ نبود داده را حدس نزن.
بدون defect اثبات‌شده title/slug/canonical آن را تغییر نده.
افت mahr/check-penalty/salary را جدا گزارش کن؛ اصلاح حقوقی/مالی بی‌منبع نکن.
```

### SG28-02

```text
TASK_ID=SG28-02. کاندیدای موجود codex/pt05-gsc-primary-20260926 در d075e2f9
را با main و PRهای فعلی تطبیق بده. ۹ commit را دوباره پیاده‌سازی نکن.
postal-code checksum claim در llms.txt و privacy/schema work-certificate
را علیه کد و رفتار واقعی بررسی کن. Critical/Important را با تست معتبر رفع کن.
گیت‌های همان SHA را اجرا و PR مستقل آماده کن؛ legacy branch یا history را force-push نکن.
```

### SG28-03

```text
TASK_ID=SG28-03. sitemap اصلی 482 loc و fetch ناموفق llm را تشخیص بده.
خطای محیط محلی را قطعی به سرور نسبت نده. علت warning/error را از GSC مجاز بگیر.
نمونه محدود URL برای status/canonical/noindex بررسی؛ هیچ sitemap یا URL حذف/submit نکن.
فقط defect بازتولیدشده را با regression test در PR کوچک اصلاح کن.
```

### SG28-04

```text
TASK_ID=SG28-04. اول گزارش SG28-02 را بخوان؛ فقط gap واقعی باقی‌مانده اجرا شود.
یک خوشه از extract-pages/date-difference/national-id/age-calculator انتخاب کن.
metadata، پاسخ کوتاه و محدودیت را با قابلیت واقعی هماهنگ کن؛ keyword stuffing نکن.
FAQ در UI و schema همسان، canonical ثابت، رفتار ابزار/premium/local-first حفظ شود.
آزمون خروجی و گیت مرتبط؛ گزارش فرضیهٔ آزمایش بدون ادعای رشد.
```

### SG28-05

```text
TASK_ID=SG28-05. HTML، identity، canonical، schema و crawler access را audit کن.
OAI-SearchBot و GPTBot را یکی ندان؛ wildcard فعلی را قبل از تغییر بخوان.
Generative AI report و inclusion حساب فقط خواندنی بررسی شود.
llms.txt به معنی موفقیت GEO نیست. نتیجه با شاهد و NOT_RUNهای روشن در geo-readiness.md.
```

### SG28-06

```text
TASK_ID=SG28-06. baseline اندازه‌گیری GEO بساز:
۱۲ پرسش عمومی ثابت، timestamp/engine/locale/citation و denominator.
referral و conversion فقط از analytics موجود مجاز و تجمیعی؛ بدون دادهٔ حساس.
گزارش Generative AI واقعی را در صورت دسترسی جدا ثبت کن؛ بدون داده صفر نساز.
اگر instrumentation جدید لازم شد طرح محدود بده؛ tracker جدید خودکار اضافه نکن.
```

### SG28-07

```text
TASK_ID=SG28-07. زوم واقعی browser 200% و روشن/تاریک را با GUI و screenshot بررسی کن.
DPR2 کافی نیست؛ نبود GUI=NOT_RUN. performance فقط در محیط غیرproduction
با cold/warm و median سه اجرا؛ timeout verification را بهبود سرعت ننام.
هیچ restart، cache purge یا load test production انجام نده.
```

### SG28-08

```text
TASK_ID=SG28-08. ابتدا وجود انتشار دارای مجوز جدا و SHA/زمان واقعی را بررسی کن.
خودت منتشر نکن. اگر پنجره‌های کامل final موجود نیست، task را BLOCKED نگه دار.
پس از کفایت داده دو دوره ۲۸روزه با segment ثابت و confounderها مقایسه کن.
رشد SEO، GEO و conversion جدا؛ نتیجه observational را causal معرفی نکن.
```
