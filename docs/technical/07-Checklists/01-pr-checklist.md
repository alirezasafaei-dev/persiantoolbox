# PTB-CHK-001 — چک‌لیست PR (قبل از Merge)

## Local‑First
- [ ] هیچ fetch/beacon/script خارجی اضافه نشده است.
- [ ] اگر استثنا لازم است: فقط same‑origin و از طریق DataHub باشد.
- [ ] سرویس‌ورکر مسیرهای جدید را مطابق tier مدیریت می‌کند.

## UX/UI
- [ ] ورودی عددی: inputMode=numeric و dir=ltr رعایت شده است.
- [ ] خطاها فیلد‑محور و قابل فهم هستند.
- [ ] در موبایل، اسکرول و layout شکستگی ندارد.

## Accessibility
- [ ] Tab order صحیح است.
- [ ] aria-invalid و aria-describedby برای فیلدهای خطادار وجود دارد.
- [ ] Modal/Menu با Esc بسته می‌شود و focus trap دارد.

## SEO
- [ ] title/description یکتا است.
- [ ] canonical درست است.
- [ ] اگر صفحه Coming‑Soon است: noindex و خارج از sitemap.

## Performance
- [ ] کتابخانه سنگین فقط در route مربوطه import شده است.
- [ ] انیمیشن اضافی در فرم‌ها وارد نشده است.

## Tests
- [ ] Golden tests (در صورت اثرگذاری) به‌روزرسانی شده‌اند.
