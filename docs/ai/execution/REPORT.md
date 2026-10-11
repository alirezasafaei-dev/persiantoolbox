# گزارش اجرای AI Workspace — 2026-10-11

> **نقطهٔ جاری پس از انتشار، 2026-10-11 15:54 UTC:** کد در PR #233 ادغام شد؛ اصلاح آمادگی تست صفحهٔ اصلی (#232) و پایداری چیدمان ابزارها (#234) نیز ادغام شدند. نسخهٔ تولید `f58ef7ad7937de8810df5de4dd3a09ffffdec0f4` با انتشار رسمی و آزمون زنده تأیید شد. نتیجه **LIVE_VERIFICATION_PASS_WITH_WARNINGS** است؛ جزئیات در [گزارش انتشار](RELEASE.md) و [گزارش زنده](../../reports/live-verification/20261011-1554-persiantoolbox.md). بخش‌های زیر شواهد تاریخیِ آماده‌سازی قبل از commit و انتشار هستند؛ عبارت‌های «merge/deploy انجام نشد» و «CI بعد از push» وضعیت جاری نیستند. تولید تصویر همچنان مسدود و غیرفعال است.

## ۱. نتیجه اجرایی

رابط `/ai/chat` از یک کارت کوچک به فضای کامل گفت‌وگوی فارسی تبدیل شد. شاخهٔ مستقل `codex/pt-ai-workspace` از `origin/main` در `cb59baa7` ساخته شد؛ checkout صاحب پروژه و تغییرات قبلی آن دست‌نخورده ماندند. این گزارش شواهد محلی را ثبت می‌کند؛ SHA نهایی و نتیجهٔ CI در PR و گزارش تحویل ذکر می‌شوند. تأیید انتشار با صاحب پروژه است.

## ۲. تجربه و تصاویر

سایدبار دسکتاپ، منوی محاوره‌ای موبایل، چند گفت‌وگو، پیش‌نویس مستقل، تغییر نام، حذف با تأیید، تم روشن/تیره و composer با ارتفاع خودکار اضافه شدند. Enter ارسال و Shift+Enter خط جدید است؛ IME از ارسال ناخواسته محافظت می‌شود. کنترل‌ها هدف لمسی ۴۴ پیکسل و focus قابل مشاهده دارند. تبلیغات شناور مخصوصاً در مسیر چت حذف شدند؛ بنر رضایت حفظ شد.

تصاویر رندر واقعی Chromium، با پاسخ مصنوعی تست و بدون اطلاعات خصوصی:

- [دسکتاپ روشن](screenshots/desktop-light.png)
- [دسکتاپ تیره](screenshots/desktop-dark.png)
- [موبایل روشن](screenshots/mobile-light.png)
- [موبایل تیره](screenshots/mobile-dark.png)

عرض‌های 320، 360، 375، 390، 430، 768، 1024، 1280، 1440 و 1920 در هر دو تم آزموده شدند. محور کد بلند داخل خود کد scroll می‌شود و کل صفحه overflow ندارد. viewport کوتاه‌شده، Escape، بازگشت focus و reduced motion بررسی شدند. صفحه‌کلید فیزیکی iOS/Android، screen reader دستی و zoom واقعی ۲۰۰٪: **NOT_RUN**.

## ۳. قابلیت اطمینان و backend

پیاده‌سازی سرور، مدل Cloudflare، قرارداد JSON، quota و دیتابیس تغییر نکردند. محافظ synchronous جلوی ارسال تکراری را می‌گیرد؛ timeout سمت کاربر ۳۵ ثانیه، لغو، بازگردانی متن خطا و کنارگذاشتن نتیجهٔ دیررس اضافه شدند. لغو انتظار تضمین لغو upstream نیست و ممکن است سهمیه مصرف شود؛ این موضوع در UI توضیح داده شده است. retry خودکار وجود ندارد.

یک باگ واقعی مرورگر بازتولید و اصلاح شد: تبدیل دکمهٔ توقف به submit در همان native click می‌توانست درخواست تازه بفرستد. دکمه‌ها key جدا دارند و توقف default action را لغو می‌کند؛ تست درخواست کنترل‌شده تعداد فراخوانی را کنترل می‌کند.

آزمون HTTP با PostgreSQL واقعی در cluster موقت محلی، دیتابیس تست مستقل و provider mock انجام شد. سهمیه‌های visitor 2/min و 5/day، global 5/min و 40/day، ۲۰ درخواست concurrent، rollback، outage و recovery، cookie امضاشده، fail-closed و عدم افشای prompt/secret در log پاس شدند. ۵۳ فراخوانی mock و صفر فراخوانی خارجی در این suite. cluster تست پس از پایان متوقف شد؛ DB موجود و تولیدی تغییر نکرد.

## ۴. تولید تصویر

[Draft PR #229](https://github.com/alirezasafaei-dev/persiantoolbox/pull/229) مستقل است، head مشاهده‌شده `f7cfce08fcd63df9514b87fa6086d68d92a2aa9f`. Checks آن head موفق بودند؛ این نتیجه اجازهٔ دسترسی provider را اثبات نمی‌کند.

[Issue #230](https://github.com/alirezasafaei-dev/persiantoolbox/issues/230) باز است: آزمون ثبت‌شدهٔ Linux به first-party POST با HTTP 403 و بدون تصویر ختم شد. آزمون عادی Windows نیز با وجود POST 200 تصویر معتبر در مهلت ثبت‌شده نداد. این‌ها شواهد موجود issue هستند، نه generation جدید این شاخه.

در این اجرا GET عادی از **WSL Ubuntu-24.04** به صفحهٔ رسمی FlatAI HTTP 200 در 2.964 ثانیه داد. این فقط دسترسی صفحه است، نه مجوز automation یا generation. اتصال Desktop Commander دستگاه `asdev-vps` را آفلاین نشان داد، ولی مسیر SSH تنظیم‌شدهٔ `pt-production` قابل دسترسی بود. GET مستقیم روی همان میزبان با proxy bypass صریح **PASS**: HTTP 200، TLS verify=0، DNS=0.101098s، TCP=0.283631s، TLS=0.474940s و total=2.750999s؛ تمام شش متغیر متداول proxy در shell میزبان unset بودند. سرویس تشخیص کشور HTTP 429 داد و تکرار نشد؛ جغرافیای egress **UNPROVEN** است. این نتیجه به میزبان همان alias مربوط است و ادعای اثبات کشور ایران یا پذیرفته‌شدن generation روی VPS نیست. WSL معادل VPS ایران نیست. هیچ دورزدن signup، CAPTCHA، proxy rotation یا تغییر شبکه انجام نشد. تصویر خاموش می‌ماند؛ قدم بعدی تأیید اپراتور FlatAI و یک generation مجاز با فایل و ابعاد معتبر روی Linux هدف است.

## ۵. کنترل‌ها

| کنترل                                                      | نتیجهٔ محلی                                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `pnpm ci:quick`                                            | **PASS**؛ lint بدون error، typecheck، local-first و 251 فایل / 1878 تست                             |
| `pnpm ci:contracts`                                        | **PASS**؛ قراردادها، flags، release checks، لینک‌ها و licensing                                     |
| `pnpm docs:auto:check`                                     | **PASS**                                                                                            |
| `pnpm test:ai:http-db`                                     | **PASS**؛ PostgreSQL مستقل، 53 mock / 0 external                                                    |
| Playwright enabled Chromium، `--workers=1 --repeat-each=2` | **PASS**؛ 10 تست، axe بدون serious/critical در محدودهٔ آزمون                                        |
| Playwright disabled Chromium                               | **PASS**؛ 1 تست                                                                                     |
| `pnpm build` و `pnpm predeploy:smoke`                      | **PASS**؛ standalone واقعی با static/public و 11 route check؛ shell موقت Git Bash برای syntax POSIX |
| `pnpm security:scan`                                       | **PASS**؛ registry پاسخ داد، vulnerability شناخته‌شده‌ای گزارش نشد                                  |
| `pnpm security:secrets` و Gitleaks staged                  | **PASS**؛ tracked scanner و staged diff بدون finding نهایی                                          |
| بازبینی مستقل                                              | **PASS**؛ ایراد P0/P1/P2 باز گزارش نشد، آخرین guard ذخیره‌سازی نیز بررسی شد                         |
| CI دقیق head                                               | پس از push؛ نتیجهٔ محلی جای CI نیست                                                                 |

دستور suite فعال: `AI_E2E_ENABLED_MOCK=true FEATURE_AI_CHAT_ENABLED=true AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=true pnpm exec playwright test tests/e2e/ai-chat-enabled.spec.ts --project=chromium --workers=1 --reporter=list --repeat-each=2`. اجرای Windows با Chrome نصب‌شده بود؛ دانلود Chromium به HTTP 403 خورد و ادامه داده نشد. در dev، مسدودشدن service worker توسط Playwright logهای catch‌شدهٔ موجود ایجاد می‌کند؛ در سناریوهای ماتریس، pageerror صفر بود. نسخهٔ lint موجود warning دارد؛ هیچ rule یا gate ضعیف نشد.

## ۶. امنیت و حریم خصوصی

اندازه‌گیری build: سه chunk ورودی ChatWorkspace جمعاً 167791 بایت خام و 50944 بایت gzip (شامل chunkهای مشترک، نه کل JS مسیر) دارند. بودجهٔ رسمی **PASS**: کل JS خام 7185.7KB، بزرگ‌ترین فایل خام 692.8KB، کل gzip برابر 2279.3KB و بزرگ‌ترین gzip برابر 315.2KB. هیچ threshold تغییر نکرد.

در [نمونهٔ عملکرد محلی](performance.json)، Chrome headless روی standalone/loopback و پاسخ مصنوعی، سه بار در عرض 1440 و سه بار در عرض 390 بررسی شد: navigation-to-input-ready برابر 324–349ms، ارسال تا رندر پاسخ mock برابر 36–50ms، CLS حداکثر 0.000014. بازگشایی تاریخچهٔ 100 turn در دسکتاپ 389ms و viewport موبایل 472ms، p95 فاصلهٔ frame در scroll برابر 16.9ms در دسکتاپ و 18.6ms در موبایل بود. این readiness شامل navigation و hydration است؛ هزینهٔ خالص hydration جدا اندازه‌گیری نشده. این نتایج نمونهٔ کوچک محلی بدون network/device throttling هستند، نه Lighthouse score یا field performance و نه latency واقعی inference.

حالت پیش‌فرض memory-only است. ذخیره در مرورگر نیاز به رضایت صریح دارد؛ خاموش‌کردن آن حذف را با read-back بررسی می‌کند. حذف ناموفق به‌اشتباه موفق اعلام نمی‌شود. تعارض زبانه‌ها جلوی بازنویسی نسخهٔ دیگر را می‌گیرد، و timer/pagehide نمی‌توانند دادهٔ حذف‌شده را زنده کنند. writeها ۲۵۰ms تجمیع می‌شوند؛ ۲۰ گفت‌وگو، ۱۰۰ turn و سقف snapshot محدود هستند. بازگشایی فقط schema معتبر و تبادل‌های کامل را می‌پذیرد. تاریخچه و پیش‌نویس‌ها با سرور همگام نمی‌شوند.

Markdown با parser موجود و renderer allowlist اجرا می‌شود؛ raw HTML اجرا نمی‌شود، تصویر خارجی دریافت نمی‌شود و schemeهای ناامن link حذف می‌شوند. متن upstream خطا نمایش داده نمی‌شود. dependency تازه، migration، secret یا paid fallback اضافه نشده است. چت برای پاسخ، متن را به سرویس می‌فرستد؛ ادعای پردازش کاملاً محلی ندارد. فقط دو تبادل قبلی با محدودیت متن context حفظ شده‌اند.

[Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service) و [Acceptable Use](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies) GitHub در همین اجرا بررسی شدند. staged scope صرفاً کد، تست، مستندات و تصاویر مصنوعی UI است؛ env، session، DB dump، backup و دادهٔ خصوصی بخشی از deliverable نیستند.

## ۷. تحویل GitHub

شاخه: `codex/pt-ai-workspace`؛ base: `cb59baa7`. commit با DCO و Draft PR بعد از gateهای محلی ایجاد می‌شوند؛ SHA و URL دقیق در تحویل نهایی ثبت می‌شوند. [Issue #231](https://github.com/alirezasafaei-dev/persiantoolbox/issues/231) و PR مرتبط با مشکلات خارج از چت مستقل باقی می‌مانند.

## ۸. دروازه‌های انتشار

کد برای review و پذیرش بصری آماده‌سازی شده است. CI باید برای head دقیق بررسی شود. یک درخواست واقعی روی **نسخهٔ فعلی تولیدی** `cf370c54afc31e7ececc9f384f572e907a08443b` HTTP 200 و پاسخ فارسی در 4312ms داد؛ این تست یک external inference بود و deploy نسخهٔ جدید را اثبات نمی‌کند. `/api/health` فعلی 200/ready مشاهده شد. production-host acceptance نسخهٔ جدید **NOT_RUN**؛ merge، deploy و تغییر production انجام نشدند.

## ۹. مانع‌ها

برای تصویر، مجوز و پاسخ provider در issue #230 حل نشده ؛ connector میزبان آفلاین است ولی transport مستقیم از SSH پاس شد و جغرافیای egress هنوز UNPROVEN است. برای انتشار چت، پذیرش بصری صاحب پروژه، CI دقیق head و مجوز release لازم‌اند. نتایج موبایل فیزیکی و assistive technology دستی هنوز اندازه‌گیری نشده‌اند. ادعای production-ready کامل تا عبور از دروازه‌های مربوط صادر نمی‌شود.

## ۱۰. نقطهٔ ادامه

از head همین Draft PR ادامه دهید: نتیجهٔ CI و artifactها را بررسی، سپس پذیرش بصری و آزمون دستگاه واقعی را ثبت کنید. تنها با مجوز مستقل release، روند رسمی blue-green در SHA immutable، backup و rollback معتبر و تمام بررسی‌های live اجرا شود. برای تصویر ابتدا issue #230 حل شود؛ فعال‌سازی عمومی یا retry نامحدود قدم بعدی نیست.
