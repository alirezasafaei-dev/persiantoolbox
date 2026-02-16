# ADR-0001: Tool Tier Resolution and `/pro` Network Policy

## وضعیت
Accepted

## مسئله
نیاز به یک سیاست قطعی برای رده‌بندی ابزارها (Offline-Guaranteed/Hybrid/Online-Required) و جلوگیری از cache شدن مسیرهای Pro در Service Worker وجود داشت، در حالی که ریپو فعلی tier صریح نداشت.

## گزینه‌ها
- گزینه A: افزودن `tier` دستی به تک‌تک entryهای registry
- گزینه B: افزودن resolver مرکزی tier بر اساس path/prefix + override اختیاری
- گزینه C: عدم افزودن tier و تکیه بر مستندات

## تصمیم
گزینه B انتخاب شد.
- `tier` در مدل registry اضافه شد.
- resolver مرکزی برای تعیین قطعی tier اضافه شد.
- `/pro` و `/pro/*` به‌صورت `Online-Required` resolve می‌شوند.
- Service Worker برای `/pro/*` به حالت `Network-Only` با `cache: no-store` اعمال شد.

## پیامدها
- مثبت:
  - tier برای همه مسیرها deterministic شد.
  - امکان اعمال policy در UI/SW بدون تکرار و drift فراهم شد.
  - ریسک cache شدن ناخواسته مسیرهای Pro حذف شد.
- منفی:
  - بخشی از tierها فعلا با resolver default تعیین می‌شوند و نیاز به بازبینی دامنه‌ای در آینده دارند.
- ریسک و mitigation:
  - ریسک: اشتباه در classification مسیرهای جدید.
  - mitigation: افزودن تست contract (`tests/unit/tool-tier-contract.test.ts`) و الزام update resolver هنگام افزودن مسیرهای جدید.

## معیار پذیرش
- `getTierByPath('/pro') === 'Online-Required'`
- `getTierByPath('/pro/*') === 'Online-Required'`
- SW شامل rule صریح `Network-Only` برای `/pro/*` باشد.
- Badge tier در شِل صفحات ابزار نمایش داده شود.
