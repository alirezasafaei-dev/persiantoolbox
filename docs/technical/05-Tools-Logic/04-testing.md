# PTB-LOG-004 — تست‌های طلایی (Golden Tests) و صحت

## هدف
جلوگیری از رگرسیون در ابزارهای مالی/حساس و افزایش اعتماد به خروجی‌ها.

## تعریف Golden Test
برای هر ابزار:
- ورودی مشخص
- خروجی مورد انتظار (Snapshot)
- تلورانس عددی (در صورت نیاز) و قوانین rounding

## ساختار پیشنهادی
- `tests/golden/<tool>/cases.json`
- `tests/golden/<tool>/expected.json`
- `tests/golden/<tool>/README.md` (توضیح منابع و فرضیات)

## معیار پذیرش
- در CI تمام golden tests پاس شوند.
- هر تغییر در خروجی باید با دلیل و به‌روزرسانی snapshot انجام شود.
