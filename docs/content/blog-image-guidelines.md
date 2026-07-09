# راهنمای تصویر بلاگ PersianToolbox

**هدف:** اسکرین‌شات واقعی از UI جعبه ابزار فارسی — نه عکس استوک.

## مسیر ذخیره

```txt
public/images/blog/<article-slug>/
  cover.webp       # 1200x630 — تصویر شاخص / OG
  step-1.webp      # شروع ابزار / فرم
  step-2.webp      # مرحله میانی
  result.webp      # خروجی
  checklist.webp   # چک‌لیست یا workflow
```

## ابعاد و فرمت

| نوع | ابعاد | فرمت | حجم هدف |
|-----|--------|------|---------|
| cover | 1200×630 | webp (ترجیح) / avif | < ۱۸۰KB |
| screenshot | عرض ≤ 1400px | webp | < ۲۵۰KB |
| workflow | ~1200×800 | webp | < ۲۵۰KB |

## قوانین اسکرین‌شات

1. فقط از UI واقعی PersianToolbox  
2. فقط دادهٔ فرضی / نمونه  
3. ممنوع: شماره موبایل، کد ملی، کارت، آدرس واقعی، نام واقعی کاربر  
4. داده حساس → blur  
5. عرض مرورگر ثابت برای یکدستی  
6. تم واقعی سایت  
7. `alt` فارسی طبیعی؛ keyword stuffing ممنوع  

## Frontmatter نمونه

```yaml
coverImage: '/images/blog/loan-calculation-visual-guide/cover.webp'
coverAlt: 'نمونه محاسبه اقساط وام در جعبه ابزار فارسی'
imageCaption: 'نمایی از ابزار محاسبه اقساط با داده‌های نمونه'
reviewedBy: null
reviewedDate: null
```

## Markdown با caption

```markdown
![فرم ورودی محاسبه وام](/images/blog/loan-calculation-visual-guide/step-1.webp)

*فرم ورودی ابزار محاسبه اقساط با مقادیر نمونه*
```

استایل prose تصاویر در `BlogPost` اعمال شده (rounded، border، shadow، max-width 100%).

## ارتباط با ارتقای Medium

جزئیات کامل فازها: `docs/content/blog-medium-upgrade-docs.md`  
پرامپت ایجنت: `docs/content/blog-medium-agent-prompt.md`
