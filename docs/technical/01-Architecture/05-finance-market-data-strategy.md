# PTB-ARC-005 — راهبرد توسعه مالی: Market Data Layer بدون تبدیل PersianToolbox به محصول معامله‌گری

## خلاصه تصمیم

پیشنهاد **ایجاد یک “Financial Hub” جدا از هویت فعلی محصول نیست**؛ چون PersianToolbox همین حالا یک هاب مالی دارد (`/tools`) و چند ابزار مالی فعال نیز در آن وجود دارد.  
پیشنهاد درست‌تر این است که هاب فعلی مالی به‌صورت **مرحله‌ای و محدود** به یک **Market Data Layer** و سپس یک **Investment Toolkit** ارتقا پیدا کند.

این تصمیم با این اصول سازگار است:

- PersianToolbox باید **ابزارمحور، SEO-first و کم‌اصطکاک** بماند.
- فیچرهای جدید باید **read-only، بدون نیاز به حساب کاربری، و قابل فهم در یک نشست** باشند.
- داده‌های حساس یا متغیر بازار باید با الگوی **same-origin + DataHub + cache** ارائه شوند.
- محصول نباید به سمت **سیگنال‌دهی، تریدینگ، یا مدیریت پرهزینه realtime** منحرف شود.

## وضعیت فعلی

### آنچه همین حالا وجود دارد

- هاب مالی روی مسیر `app/(tools)/tools/page.tsx`
- دسته‌بندی مالی در رجیستری ابزارها در `lib/tools-registry.ts`
- ابزارهای مالی فعال:
  - `loan`
  - `salary`
  - `interest`
  - `currency-converter`
  - `inflation-calculator`
  - `investment-calculator`
  - `tax-calculator`
  - `bank-rate-comparator`
  - `living-cost`
- اجزای reusable:
  - `components/features/finance/FinanceTrustBlock.tsx`
  - `components/features/finance/RelatedFinanceTools.tsx`
  - `components/features/finance/DataVersionBadge.tsx`
  - `shared/analytics/financeSaved.ts`
- الگوی DataHub داخلی در `app/api/data/salary-laws/route.ts`
- سیاست Local-First و Hybrid Data در:
  - `docs/technical/01-Architecture/01-local-first-architecture.md`
  - `docs/technical/01-Architecture/02-datahub.md`

### مسئله اصلی

بخش مالی فعلی بیشتر روی **محاسبه‌گرهای تصمیم‌سازی** متمرکز است، اما ابزارهایی مثل `currency-converter` و `bank-rate-comparator` در وضعیت فعلی:

- به‌جای داده معتبر بازار، داده‌های نمونه/ثابت دارند
- از نظر SEO پتانسیل کامل خود را استفاده نکرده‌اند
- هنوز به یک مدل روشن برای stale data، snapshot، تاریخچه، و آپدیت دوره‌ای وصل نشده‌اند

بنابراین سؤال درست این نیست که «آیا Financial Hub بسازیم؟» بلکه این است که:

> آیا PersianToolbox باید هاب مالی فعلی را به یک لایه محدود و قابل اتکا برای داده‌های بازار و ابزارهای تصمیم‌سازی توسعه دهد؟

پاسخ پیشنهادی: **بله، اما فقط به‌صورت محدود، تدریجی، و toolbox-native.**

## تحلیل محصول

### چرا این توسعه fit خوبی دارد

1. **هم‌راستا با هویت محصول**
   - PersianToolbox از قبل ابزارهای مالی دارد.
   - توسعه در امتداد همین دسته، توسعه ارگانیک محسوب می‌شود نه pivot.

2. **سازگار با الگوی UX فعلی**
   - کاربران PersianToolbox انتظار ابزارهای سریع، بدون ثبت‌نام، و نتیجه فوری دارند.
   - ابزارهای market snapshot و simulator دقیقاً با همین رفتار کاربر جور هستند.

3. **فرصت SEO واقعی**
   - کوئری‌های فارسی مثل:
     - `قیمت دلار امروز`
     - `قیمت طلا امروز`
     - `قیمت بیت کوین به تومان`
     - `اگر 5 سال پیش دلار می‌خریدم`
     - `مقایسه بازده طلا و دلار`
   - هم حجم جستجو و هم intent بازگشت‌پذیر دارند.

4. **افزایش بازگشت کاربر**
   - ابزارهای صرفاً محاسباتی معمولاً session-driven هستند.
   - market snapshot و historical comparison می‌توانند **repeat visit loop** ایجاد کنند.

5. **تقویت CTA و revenue funnel**
   - کاربران مالی/تحلیلی احتمالاً fit خوبی برای:
     - خدمات تحلیلی/اتوماسیون
     - داشبوردهای سفارشی
     - consulting
   - بنابراین این بخش فقط traffic نمی‌سازد؛ می‌تواند traffic با intent بالاتر بسازد.

### چرا نباید به “super app مالی” تبدیل شود

1. **نگهداری realtime گران و شکننده است**
   - live tick-level data
   - alerting دائمی
   - websocket infra
   - notification delivery
   - data vendor reliability

2. **ریسک اعتماد و مسئولیت**
   - هرچه به signal, advice, or portfolio recommendation نزدیک‌تر شویم، ریسک سوءبرداشت بالاتر می‌رود.

3. **ناسازگاری با Local-First**
   - بخش زیادی از ارزش PersianToolbox روی runtime ساده، privacy-first و resilience است.
   - realtime-first architecture این مزیت را تضعیف می‌کند.

4. **خطر dilution**
   - اگر حوزه مالی بیش از حد بزرگ شود، PersianToolbox از “toolbox” به “financial media product” شیفت می‌کند.
   - این تغییر در این مرحله توصیه نمی‌شود.

## نتیجه محصول

### تصمیم توصیه‌شده

**Financial Hub به‌عنوان نام مفهومی قابل قبول است، اما به‌عنوان scope نباید به معنی ساخت یک محصول مالی مستقل باشد.**

توصیه نهایی:

- هاب مالی فعلی حفظ شود.
- توسعه بعدی با تمرکز بر:
  - **market-aware calculators**
  - **historical comparison**
  - **cached read-only dashboards**
  - **SEO landing pages**
- از scopeهای زیر فعلاً اجتناب شود:
  - portfolio management کامل
  - push alerts production-grade
  - real-time tick streaming
  - authenticated investment platform UX

## استراتژی پیشنهادی

## Phase 1 — MVP: Market-Aware Decision Tools

هدف: افزایش ارزش کاربر و SEO بدون افزایش شدید پیچیدگی عملیاتی

### فیچرها

1. **Market Snapshot Dashboard**
   - نرخ ارزهای اصلی
   - طلا/سکه
   - 3-5 ارز دیجیتال اصلی
   - timestamp واضح + منبع + وضعیت stale

2. **Historical Return Simulator**
   - «اگر X تومان در تاریخ Y روی دارایی Z سرمایه‌گذاری می‌کردم امروز چقدر می‌شد؟»
   - دارایی‌های اولیه:
     - USD
     - EUR
     - Gold
     - Bitcoin

3. **Simple Comparison Charts**
   - نمودار خطی سبک و ساده
   - بازه‌های زمانی محدود:
     - 30 روز
     - 90 روز
     - 1 سال
     - 3 سال

4. **Read-Only Experience**
   - بدون حساب کاربری
   - بدون watchlist
   - بدون alert

5. **SEO Landing Pages**
   - هاب موضوعی market pages
   - FAQ و schema مناسب
   - internal linking از ابزارهای مالی موجود

### دلیل انتخاب

- fit بالا با toolbox
- maintenance قابل مدیریت
- ایجاد repeat visits
- امکان reuse زیرساخت فعلی

## Phase 2 — Insight Layer

هدف: عمیق‌تر کردن use case بدون ورود به complexity شدید account-based

### فیچرها

1. Historical comparisons بین چند دارایی
2. Advanced but lightweight charts
3. Scenario presets
4. Compare against inflation
5. Saved local scenarios in browser

### نکته مهم

در این فاز نیز **حساب کاربری الزامی نیست**.  
اولویت با حفظ friction پایین و SEO indexability است.

## Phase 3 — User Layer (اختیاری)

این فاز فقط زمانی توصیه می‌شود که Phase 1/2:

- ترافیک ثابت تولید کنند
- retention ملموس بسازند
- data ops پایدار شده باشد

### فیچرهای احتمالی

1. Watchlist
2. Price alerts
3. User account sync
4. Portfolio tracking
5. Notification channels

### شرط ورود

- data sourcing پایدار
- background jobs عملیاتی
- cost model شفاف
- نیاز واقعی کاربر، نه صرفاً جذابیت feature

## Long-Term

- investment calculator ecosystem
- market-linked salary / inflation / purchasing power tools
- AI-assisted explanation layer (not advice)
- structured financial content around calculators and scenarios

## تعریف MVP توصیه‌شده

### MVP دقیق

MVP پیشنهادی این بخش:

1. داشبورد read-only داده بازار
2. شبیه‌ساز بازده تاریخی
3. چند نمودار سبک
4. چند landing page سئویی
5. data freshness UX

### آنچه عمداً خارج از MVP است

- ثبت‌نام
- هشدار قیمت
- portfolio management
- realtime websockets
- advanced personalization
- heavy charting infra

## تحلیل فنی

### معماری پیشنهادی

معماری باید Hybrid و same-origin بماند:

1. **UI layer**
   - صفحات هاب و ابزارها در App Router
   - metadata و schema برای هر صفحه

2. **DataHub layer**
   - endpointهای داخلی مثل:
     - `GET /api/data/market/overview`
     - `GET /api/data/market/history?asset=usd&range=1y`
     - `GET /api/data/market/assets`
   - همه کلاینت‌ها فقط از same-origin fetch کنند

3. **Ingestion layer**
   - jobهای server-side برای fetch از منابع معتبر
   - validate + normalize + checksum
   - cache replacement به‌صورت atomic

4. **Storage layer**
   - Phase 1:
     - file-based cache برای latest snapshots
     - Postgres برای historical series در صورت نیاز
   - اگر تاریخچه محدود باشد، حتی Phase 1 را می‌توان با snapshot file + compact JSON شروع کرد

### Data source strategy

اصل مهم:

- **هیچ vendor lock-in از روز اول نداشته باشیم**
- abstraction برای source adapters تعریف شود
- source reliability از cost مهم‌تر است

پیشنهاد عملی:

1. یک adapter interface داخلی
2. حداقل دو source candidate برای هر dataset
3. canonical normalized schema
4. source attribution در meta

### Cache strategy

برای هر dataset:

- `fetchedAt`
- `lastSuccessfulFetch`
- `expiresAt`
- `stale`
- `staleReason`
- `source`
- `checksum`
- `version`

پیشنهاد TTL:

- market overview: 5 تا 15 دقیقه
- gold/coin snapshot: 5 تا 15 دقیقه
- crypto snapshot: 2 تا 10 دقیقه
- historical daily series: 24 ساعت یا بیشتر

### Background jobs

نیاز به jobهای ساده و deterministic:

1. fetch latest snapshot
2. fetch/update historical daily bars
3. validate data shape
4. write cache atomically
5. keep last-known-good data

### Historical storage

برای historical data دو سناریو وجود دارد:

1. **Compact DB-backed**
   - جدول daily price points
   - مناسب برای compare, ranges, charting
2. **File-backed snapshots**
   - ساده‌تر برای شروع
   - محدودتر برای query flexibility

توصیه:

- اگر فقط 4-8 asset و daily granularity داریم، Postgres ارزشمند است.
- اگر MVP خیلی محدود است، file cache + periodic generated JSON هم قابل قبول است.

### Scalability concerns

1. read traffic زیاد خواهد شد، write traffic کم
2. endpointهای market overview باید cache-friendly باشند
3. historical endpoints باید output محدود و pre-aggregated بدهند
4. chart payloadها باید سبک بمانند
5. از websocket و long-polling در MVP اجتناب شود

### SEO considerations

این initiative فقط وقتی موفق است که صفحه‌محور باشد، نه widget-محور.

#### Must-have

- indexable landing pages
- category/hub ItemList schema
- FAQPage برای intent informational
- canonicalهای پایدار
- title/description یکتا
- stale/update timestamp visible

#### Recommended pages

- `/tools` به‌عنوان هاب فعلی
- در صورت نیاز، زیرمسیرهای مشخص مثل:
  - `/tools/market-dashboard`
  - `/tools/historical-return-calculator`
  - `/guides/best-investment-comparison-...`

#### Avoid

- parameter-only thin pages
- charts بدون متن و context
- duplicate market pages با keyword stuffing

### Security implications

1. هیچ secret در کلاینت
2. vendor keys فقط server-side
3. rate limiting روی data endpoints
4. input validation برای query params
5. output sanitation
6. clear disclaimer: educational / decision-support, not advice

### Operational cost

هزینه اصلی در این initiative:

- data sourcing
- job reliability
- storage رشد تاریخچه
- monitoring freshness

برای کنترل هزینه:

- دارایی‌ها را محدود نگه دارید
- granularity را daily نگه دارید
- Phase 1 را read-only نگه دارید
- vendor abstraction را ساده اما واقعی نگه دارید

## Reusable infrastructure

مواردی که همین حالا قابل reuse هستند:

- App Router page conventions
- `buildMetadata()` در `lib/seo.ts`
- JSON-LD generation در `lib/seo-tools.ts`
- category + hub modeling در `lib/tools-registry.ts`
- `DataVersionBadge` pattern برای freshness UX
- `salary-laws` data endpoint contract به‌عنوان الگوی DataHub
- analytics ingestion و summary infra
- rate limiting patterns
- admin/ops snapshot patterns

## ریسک‌ها

1. **داده نامعتبر یا ناپایدار**
2. **افزایش scope به سمت product مالی مستقل**
3. **بالا رفتن هزینه نگهداری realtime**
4. **اعتماد کاربر در صورت stale data بدون messaging مناسب**
5. **SEO pages thin-content اگر فقط عدد نمایش دهند**

## Open Questions

1. canonical source of truth برای دلار/طلا/سکه/crypto چه باشد؟
2. granularity MVP روزانه باشد یا ساعتی؟
3. آیا `/tools` همچنان canonical hub بماند یا `/finance` فقط به‌عنوان alias/redirect اضافه شود؟
4. آیا coin/gold data از روز اول ضروری است یا باید با FX + crypto شروع شود؟
5. آیا Phase 1 فقط snapshot + simulator باشد یا comparison page نیز همزمان بیاید؟

## TODO Checklist

- [ ] تصمیم نهایی روی scope: Market Data Layer vs full Financial Hub
- [ ] تعریف asset shortlist برای MVP
- [ ] تعریف source adapter contract
- [ ] طراحی schema برای snapshot meta و historical series
- [ ] تعریف cache TTL برای هر dataset
- [ ] تعیین routing strategy نهایی
- [ ] تعریف SEO templates برای market pages
- [ ] تعریف disclaimer contract برای تمام صفحات مالی market-aware
- [ ] تعیین storage mode MVP (file vs postgres)
- [ ] تعریف ops monitoring برای data freshness
- [ ] اولویت‌بندی فاز ۱ در roadmap اصلی

## جمع‌بندی نهایی

توسعه مالی **توصیه می‌شود**، اما نه به شکل یک “vertical” مستقل و نه با scope سنگین.

بهترین مسیر:

1. هاب مالی موجود را حفظ کنید
2. آن را به لایه‌ای از **market-aware, read-only, SEO-friendly decision tools** ارتقا دهید
3. ابتدا روی snapshot + historical simulation تمرکز کنید
4. alerts, portfolio, accounts را فقط بعد از اثبات retention و data stability بررسی کنید

این مسیر هم با هویت PersianToolbox سازگار است، هم شانس SEO و بازگشت کاربر را بالا می‌برد، و هم هزینه عملیاتی را در سطح معقول نگه می‌دارد.
