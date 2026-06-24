# راهنمای دستیار هوش مصنوعی کم‌هزینه

برای کاهش هزینه پروژه، یک اسکریپت ساده اضافه شده که ترتیب تلاش providerها را به‌صورت قابل‌تنظیم اجرا می‌کند:

- پیش‌فرض: `openai` (در صورت وجود کلید)، بعد `deepseek`، بعد `openrouter`
- اگر provider ای خطا بدهد، روی provider بعدی fallback می‌کند.

- اجرای مستقیم:
  - `pnpm ai:ask "یه تابع debounce در TypeScript بنویس"`
- ورودی از stdin:
  - `cat prompt.txt | pnpm ai:ask`
- خروجی ساختاری (JSON):
  - `pnpm ai:ask --json "..."`

### مهم

- `--providers=` ترتیب providerها را تعیین می‌کند، مثال:
  - `pnpm ai:ask --providers=deepseek,openrouter "..."`
- کش فایل local برای جلوگیری از تکرار درخواست:
  - پیش‌فرض: `.cache/ai-cache.jsonl`
  - برای خاموش کردن کش: `--no-cache`
- محدود کردن هزینه:
  - `--max-tokens=600`
  - `--temp=0.2`

### کلیدها و مدل‌ها

در `.env` یا محیط اجرا:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (پیش‌فرض: `gpt-4o-mini`)
- `OPENAI_API_BASE_URL` (اختیاری برای اتصال به proxy یا endpoint سفارشی؛ مثلا `https://api.openai.com`)
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL` (پیش‌فرض: `deepseek-chat`)
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (پیش‌فرض: `google/gemma-2-9b-it:free`)
- `OPENAI_INPUT_PRICE_PER_1M` / `OPENAI_OUTPUT_PRICE_PER_1M`
- `DEEPSEEK_INPUT_PRICE_PER_1M` / `DEEPSEEK_OUTPUT_PRICE_PER_1M`
- `OPENROUTER_INPUT_PRICE_PER_1M` / `OPENROUTER_OUTPUT_PRICE_PER_1M`

اگر قیمت تنظیم نشود، برآورد هزینه نمایش داده نمی‌شود.

### نکته درباره "پراکسی کردن GitHub Codebase"

`pnpm ai:ask` فقط یک call ساده به Chat API است و خودش clone یا inspect کامل ریپو را انجام نمی‌دهد.
برای اینکه ChatGPT مستقیم به کد دسترسی داشته باشد باید یکی از این مدل‌ها را داشته باشی:

1. proxy/internal service (مرجعی که GitHub یا فایل‌ها را بخواند و متن‌های لازم را از prompt بسازد)
2. ابزارهایی مثل OpenAI File/Responses یا MCP/Agent server که فایل‌سیستم را expose می‌کنند
3. یا workflow سفارشی خودت که قبل از ارسال، مسیر/فایل‌های مرتبط را به prompt اضافه کند

به بیان ساده: بله، می‌شود "از همین سیستم" یک proxy ساخت که کد را جمع کند و به صورت امن ارسال کند؛ در این repo هم مسیر امن‌تر اینه که endpoint خودت را با `OPENAI_API_BASE_URL` تنظیم کنی.
