# SEO & Content Plan — PersianToolbox

**Date:** 2026-06-27
**Based on:** Live Growth Audit 2026-06-27

---

## Current SEO State

### Critical Issues

| Issue                                 | Severity | Status                       |
| ------------------------------------- | -------- | ---------------------------- |
| All canonical URLs use localhost:3000 | CRITICAL | Must fix before any SEO work |
| Sitemap uses localhost:3000           | CRITICAL | 373 entries all wrong        |
| Robots.txt Host is localhost:3000     | CRITICAL | Wrong canonical domain       |
| OG images use localhost:3000          | CRITICAL | Social sharing broken        |
| JSON-LD uses localhost:3000           | CRITICAL | Rich results broken          |

### What Works

| Item              | Status                                 |
| ----------------- | -------------------------------------- |
| Title tags        | ✅ Unique, descriptive, Persian        |
| Meta descriptions | ✅ Unique, keyword-rich                |
| robots meta       | ✅ index, follow on most pages         |
| OpenGraph images  | ✅ Per-tool OG images exist            |
| FAQ schema        | ✅ Present on pricing, homepage        |
| Sitemap structure | ✅ 373 entries with priority/frequency |
| Internal linking  | ✅ Homepage links to all categories    |

---

## Keyword/Topic Clusters

### A) فاکتورساز و رسیدساز (Invoice/Receipt Maker)

**Search Intent:** Users need to create invoices, receipts, proforma invoices for business transactions.

| #   | Content Page Idea             | Type         | Search Intent | Primary CTA        | Internal Links                                | Schema              |
| --- | ----------------------------- | ------------ | ------------- | ------------------ | --------------------------------------------- | ------------------- |
| 1   | فاکتورساز آنلاین رایگان       | Tool Landing | Transactional | ساخت فاکتور        | /business-tools/document-studio               | SoftwareApplication |
| 2   | نحوه نوشتن فاکتور رسمی        | Guide        | Informational | استفاده از ابزار   | /business-tools/document-studio               | HowTo               |
| 3   | تفاوت فاکتور و رسید           | Guide        | Informational | ساخت هر دو         | /business-tools                               | FAQPage             |
| 4   | فاکتورساز بدون ثبت‌نام        | Landing      | Transactional | شروع رایگان        | /business-tools/document-studio               | SoftwareApplication |
| 5   | قالب فاکتور حرفه‌ای فارسی     | Tool Landing | Transactional | انتخاب قالب        | /business-tools/document-studio?type=invoice  | SoftwareApplication |
| 6   | فاکتور فروش کالا              | Guide        | Informational | ساخت فاکتور        | /business-tools/document-studio?type=invoice  | HowTo               |
| 7   | رسید پرداخت آنلاین            | Tool Landing | Transactional | ساخت رسید          | /business-tools/document-studio?type=receipt  | SoftwareApplication |
| 8   | پیش‌فاکتور (Proforma Invoice) | Guide        | Informational | ساخت پیش‌فاکتور    | /business-tools/document-studio?type=proforma | HowTo               |
| 9   | قوانین فاکتور رسمی ایران      | Guide        | Informational | ساخت فاکتور قانونی | /terms, /privacy                              | Article             |
| 10  | فاکتورساز برای فریلنسرها      | Landing      | Transactional | شروع رایگان        | /business-tools/document-studio               | SoftwareApplication |

**Risk Notes:**

- Do NOT claim "رسمی" (official) or "قانونی" (legal) without caveats
- Always add "برای استفاده عمومی مناسب است" disclaimer
- Do NOT claim tax compliance

### B) رزومه‌ساز حرفه‌ای (Professional Resume Builder)

**Search Intent:** Users need to create resumes/CVs for job applications in Persian or English.

| #   | Content Page Idea         | Type         | Search Intent | Primary CTA        | Internal Links                                   | Schema              |
| --- | ------------------------- | ------------ | ------------- | ------------------ | ------------------------------------------------ | ------------------- |
| 1   | رزومه ساز آنلاین فارسی    | Tool Landing | Transactional | ساخت رزومه         | /career-tools/resume-builder                     | SoftwareApplication |
| 2   | نحوه نوشتن رزومه حرفه‌ای  | Guide        | Informational | استفاده از ابزار   | /career-tools/resume-builder                     | HowTo               |
| 3   | رزومه انگلیسی برای کار    | Tool Landing | Transactional | ساخت رزومه انگلیسی | /career-tools/resume-builder?type=english-resume | SoftwareApplication |
| 4   | تفاوت رزومه و CV          | Guide        | Informational | ساخت هر دو         | /career-tools                                    | FAQPage             |
| 5   | رزومه بدون ثبت‌نام        | Landing      | Transactional | شروع رایگان        | /career-tools/resume-builder                     | SoftwareApplication |
| 6   | نمونه رزومه حرفه‌ای       | Guide        | Informational | ساخت رزومه         | /career-tools/resume-builder                     | Article             |
| 7   | رزومه برای رشته‌های مختلف | Guide        | Informational | ساخت رزومه تخصصی   | /career-tools/resume-builder                     | Article             |
| 8   | نکات مصاحبه شغلی          | Guide        | Informational | بهبود رزومه        | /blog                                            | Article             |
| 9   | Cover Letter فارسی        | Tool Landing | Transactional | ساخت نامه پوششی    | /career-tools/resume-builder?type=cover-letter   | SoftwareApplication |
| 10  | رزومه برای استخدام دولتی  | Guide        | Informational | ساخت رزومه         | /career-tools/resume-builder                     | Article             |

**Risk Notes:**

- Do NOT claim "تضمین استخدام" (hiring guarantee)
- Do NOT claim "ATS-compatible" without verification
- Always add "رزومه نهایی با مشاور شغلی بررسی کنید" disclaimer

### C) ویرایشگر فارسی (Persian Editor)

**Search Intent:** Users need to correct Persian text, fix ZWNJ, normalize characters, improve typography.

| #   | Content Page Idea        | Type         | Search Intent | Primary CTA      | Internal Links                        | Schema              |
| --- | ------------------------ | ------------ | ------------- | ---------------- | ------------------------------------- | ------------------- |
| 1   | اصلاح نیم فاصله آنلاین   | Tool Landing | Transactional | اصلاح متن        | /writing-tools/persian-writing-studio | SoftwareApplication |
| 2   | تبدیل حروف عربی به فارسی | Tool Landing | Transactional | اصلاح متن        | /writing-tools/persian-writing-studio | SoftwareApplication |
| 3   | ویرایشگر فارسی پیشرفته   | Tool Landing | Transactional | شروع ویرایش      | /writing-tools/persian-writing-studio | SoftwareApplication |
| 4   | اصلاح نگارش فارسی        | Guide        | Informational | استفاده از ابزار | /writing-tools/persian-writing-studio | HowTo               |
| 5   | نیم فاصله چیست؟          | Guide        | Informational | اصلاح نیم فاصله  | /writing-tools/persian-writing-studio | Article             |
| 6   | تفاوت ی عربی و ی فارسی   | Guide        | Informational | اصلاح متن        | /writing-tools/persian-writing-studio | Article             |
| 7   | پاک‌سازی متن فارسی       | Tool Landing | Transactional | پاک‌سازی متن     | /writing-tools/persian-writing-studio | SoftwareApplication |
| 8   | اصلاح فاصله‌گذاری فارسی  | Tool Landing | Transactional | اصلاح فاصله      | /writing-tools/persian-writing-studio | SoftwareApplication |
| 9   | آمار متن فارسی           | Tool Landing | Transactional | مشاهده آمار      | /writing-tools/persian-writing-studio | SoftwareApplication |
| 10  | ویرایش مقاله فارسی       | Guide        | Informational | ویرایش متن       | /writing-tools/persian-writing-studio | HowTo               |

**Risk Notes:**

- This is PersianToolbox's STRONGEST competitive position — no strong competitor
- Focus on "اصلاح نیم فاصله" as the primary SEO keyword
- Create standalone /zwnj-correction page for maximum SEO impact

---

## Content Calendar (3 months)

### Month 1: Foundation

| Week | Articles | Focus                                                               |
| ---- | -------- | ------------------------------------------------------------------- |
| 1    | 5        | Invoice maker guides (نحوه نوشتن فاکتور, تفاوت فاکتور و رسید, etc.) |
| 2    | 5        | Resume builder guides (نحوه نوشتن رزومه, نمونه رزومه, etc.)         |
| 3    | 5        | Persian editor guides (نیم فاصله چیست, تفاوت ی عربی و فارسی, etc.)  |
| 4    | 5        | General tool guides (ابزار PDF چیست, محاسبه وام, etc.)              |

### Month 2: Expansion

| Week | Articles | Focus                                                                               |
| ---- | -------- | ----------------------------------------------------------------------------------- |
| 5-6  | 10       | Long-tail keywords (رزومه برای رشته‌های مختلف, فاکتور فروش کالا, etc.)              |
| 7-8  | 10       | Comparison articles (فاکتورساز آنلاین vs نرم‌افزار, رزومه‌ساز رایگان vs پولی, etc.) |

### Month 3: Depth

| Week  | Articles | Focus                                                                 |
| ----- | -------- | --------------------------------------------------------------------- |
| 9-10  | 10       | Advanced guides (قوانین فاکتور رسمی, نکات مصاحبه شغلی, etc.)          |
| 11-12 | 10       | Tool-specific guides (PDF merge guide, image compression guide, etc.) |

---

## SEO Technical Checklist

### Before Publishing Any Content

- [ ] Unique title tag (60 chars max)
- [ ] Unique meta description (160 chars max)
- [ ] Canonical URL set to production domain
- [ ] OG image set (1200x630)
- [ ] JSON-LD schema added (Article, HowTo, or FAQPage)
- [ ] Internal links to 3+ related pages
- [ ] Breadcrumb schema added
- [ ] Mobile-responsive layout
- [ ] Fast loading (<3s LCP)

### Content Quality Rules

- [ ] Written by humans, not AI-generated fluff
- [ ] Practical examples with real use cases
- [ ] Persian language throughout (no English mix)
- [ ] Clear value proposition in first paragraph
- [ ] CTA to tool on every page
- [ ] Disclaimer where needed (not legal advice, etc.)
- [ ] No fake claims or overclaiming
- [ ] No "official" or "guaranteed" claims

---

## Internal Linking Strategy

### Homepage Links To

- All 10 categories
- 3 flagship products
- Pricing page
- Blog section

### Category Pages Link To

- All tools in category
- Related categories
- Pricing page
- Blog posts about category

### Tool Pages Link To

- Category page
- Related tools
- Pricing page
- Blog posts about tool

### Blog Posts Link To

- Related tools
- Category pages
- Other blog posts
- Pricing page

---

## Schema Markup Plan

### Homepage

```json
{
  "@type": "WebSite",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://persiantoolbox.ir/search?q={search_term_string}"
  }
}
```

### Tool Pages

```json
{
  "@type": "SoftwareApplication",
  "name": "فاکتورساز آنلاین",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "IRR"
  }
}
```

### Guide Pages

```json
{
  "@type": "HowTo",
  "name": "نحوه نوشتن فاکتور رسمی",
  "step": [...]
}
```

### FAQ Pages

```json
{
  "@type": "FAQPage",
  "mainEntity": [...]
}
```

---

## Success Metrics

| Metric              | Current            | 30 days | 90 days | 6 months |
| ------------------- | ------------------ | ------- | ------- | -------- |
| Indexed pages       | ~0 (localhost bug) | 373     | 500+    | 800+     |
| Organic impressions | Unknown            | 10,000  | 100,000 | 500,000  |
| Organic clicks      | Unknown            | 500     | 5,000   | 25,000   |
| Average position    | Unknown            | 30+     | 20+     | 15+      |
| Featured snippets   | 0                  | 5       | 20      | 50       |
| Backlinks           | Unknown            | +10     | +50     | +200     |

---

## Competitor SEO Gaps

| Competitor   | What They Do Well          | PersianToolbox Opportunity          |
| ------------ | -------------------------- | ----------------------------------- |
| Karboom      | 50K-334K views per article | Create similar depth content        |
| CVBuilder.me | 30+ resume templates page  | Create template gallery             |
| FactorArsa   | Comprehensive FAQ section  | Add FAQ to all tool pages           |
| NegarNo      | PWA install for mobile     | Already have PWA — promote it       |
| NoBsResume   | "No BS" positioning        | Emphasize privacy-first positioning |

---

## Risk Mitigation

| Risk                            | Mitigation                                 |
| ------------------------------- | ------------------------------------------ |
| Google penalty for thin content | Only publish high-quality, helpful content |
| Duplicate content               | Use canonical URLs, unique titles          |
| Keyword stuffing                | Write naturally, focus on user value       |
| Slow loading pages              | Optimize images, lazy load                 |
| Mobile usability issues         | Test on real devices                       |
