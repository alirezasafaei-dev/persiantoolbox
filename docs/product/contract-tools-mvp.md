# Contract Tools MVP — Product Specification

## Overview

ابزار تولید پیش‌نویس قرارداد قابل ویرایش برای کاربران فارسی‌زبان.

## Templates

| Template             | ID                        | Fields | Clauses | Tier |
| -------------------- | ------------------------- | ------ | ------- | ---- |
| قرارداد اجاره مسکونی | `rental-lease`            | 24     | 4+4     | Free |
| قرارداد پیمانکاری    | `construction-contractor` | 28     | 3+2     | Free |

## User Flow

1. `/contract-tools` — انتخاب نوع قرارداد
2. `/contract-tools/rental-lease` یا `/contract-tools/construction-contractor`
3. فرم اطلاعات طرفین
4. فرم جزئیات قرارداد
5. انتخاب بندها
6. پیش‌نمایش زنده
7. تأیید سلب مسئولیت
8. دانلود خروجی

## Free/Premium

- **Free**: پیش‌نمایش + دانلود متنی با واترمارک + سلب مسئولیت
- **Premium**: حذف واترمارک + PDF + Word + ذخیره + بندهای حرفه‌ای (feature-flagged)

## SEO

- `/contract-tools` — landing page with FAQ
- `/contract-tools/rental-lease` — indexed
- `/contract-tools/construction-contractor` — indexed
- BreadcrumbList JSON-LD on all pages
- Keywords: نمونه قرارداد, قرارداد اجاره, قرارداد پیمانکاری, پیش‌نویس قرارداد
