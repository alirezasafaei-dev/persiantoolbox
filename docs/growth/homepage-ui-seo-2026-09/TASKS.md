# وضعیت تسک‌ها

وضعیت‌های مجاز: READY، IN_PROGRESS، BLOCKED، REVIEW، DONE، DEFERRED.
DONE فقط با شواهد؛ REVIEW یعنی پیاده‌سازی آماده بازبینی، نه تأیید مالک یا استقرار.
هم‌زمان یک تسک اجرایی IN_PROGRESS باشد. نبود داده GSC مانع UI/SEO قطعی نیست.

| ID    | کار                            | وابستگی                 | وضعیت اولیه | خروجی پذیرش                                     |
| ----- | ------------------------------ | ----------------------- | ----------- | ----------------------------------------------- |
| PT-00 | checkout ایزوله و ثبت baseline | ندارد                   | DONE        | SHA، وضعیت محلی، screenshots و گزارش مبنا       |
| PT-01 | schema و ادعاهای حریم خصوصی    | PT-00                   | DONE        | تست رفتاری schema، copy همسان، لینک صحیح برند   |
| PT-02 | هیرو و کارت‌های صفحه اصلی      | PT-00                   | REVIEW      | قبل/بعد روشن و تاریک، جستجو/CTA سالم            |
| PT-03 | آزمون یکپارچه و آماده‌سازی PR  | PT-01، PT-02            | REVIEW      | رفع شکست CI، QA، build، smoke، E2E، گزارش نهایی |
| PT-04 | تشخیص هم‌پوشانی اعلان‌ها       | PT-00                   | DONE        | بازتولید و پیشنهاد دقیق؛ تغییر رفتار تأیید نشده |
| PT-05 | تحلیل GSC و صف محتوای GEO      | داده مجاز تازه          | BLOCKED     | مقایسه دوره‌ها، فرصت مستند، بدون انتشار محتوا   |
| PT-06 | استقرار نسخه مشخص              | PT-03 و تأیید صریح مالک | BLOCKED     | قرارداد استقرار و audit پس از deploy            |

## Snapshot correction — 2026-09-21

- Automated UI checks and the historical production run are documented in [`reports/post-merge-handoff.md`](reports/post-merge-handoff.md). They do not change the task states above: PT-03 remains REVIEW because actual browser zoom 200% is NOT_RUN, PT-05 remains BLOCKED for missing authorized GSC data, and PT-06 remains BLOCKED for any new release action without explicit owner approval.
- `deviceScaleFactor: 2` is recorded as DPR 2 density only. It must not be called browser zoom.

## ثبت پیشرفت

در هر تغییر وضعیت، ID، زمان UTC، SHA، شواهد و مانع را در گزارش مرحله ثبت کن.
هنگام شروع PT-00، وضعیت همان ردیف را IN_PROGRESS کن. تسک BLOCKED را با دلیل و کوچک‌ترین اقدام لازم نگه دار و کار مستقل را ادامه بده.
برای PT-04، تشخیص می‌تواند DONE شود؛ پیاده‌سازی رفتار صرفاً بعد از ثبت تأیید در تصمیمات گزارش مجاز است.
