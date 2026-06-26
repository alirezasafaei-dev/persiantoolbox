# Persian Writing Studio — Product Specification

## Overview

**Persian Writing Studio** (ویرایشگر فارسی پیشرفته) is a local-first Persian text normalization and cleanup tool. It processes text entirely in the browser with no server sends.

## Product Positioning

این ابزار برای پاک‌سازی، استانداردسازی و بهبود نگارش فارسی بر اساس قواعد زبانی و تنظیمات انتخاب‌شده توسط کاربر طراحی شده است و جایگزین ویراستار انسانی، مشاوره تخصصی، داوری علمی یا تضمین کیفیت نهایی متن نیست.

## Document Types

One flagship editor: Persian text cleanup and normalization.

## Features

### Text Normalization

- Arabic ي → Persian ی
- Arabic ك → Persian ک
- Persian/English digit normalization
- Remove extra spaces
- Normalize line breaks
- Fix spaces before/after punctuation
- Normalize Persian comma/question mark/semicolon
- Detect repeated words
- Detect repeated punctuation
- Normalize ZWNJ for می/نمی cases

### Safety

- Preserve URLs
- Preserve emails
- Preserve phone numbers
- Preserve code-like snippets
- Do not aggressively rewrite meaning

### Modes

- **Safe**: Only Arabic letter conversion and digit normalization
- **Standard**: All normalization rules
- **Strict**: (Premium/locked) — aggressive cleanup
- **Formal**: (Coming soon) — no external AI

### UX

- Large RTL text editor
- Original/cleaned text panels
- Text statistics (chars, words, sentences, paragraphs, reading time)
- Issue counts by category
- Copy output
- Download TXT
- Undo/reset
- Local draft autosave
- Restore after refresh

## Free vs Premium

### Free

- Max 5,000 characters
- Safe/standard cleanup modes
- Copy output
- TXT download
- Local draft (max 5)
- Basic statistics

### Premium

- Longer text limit
- DOCX export
- Strict mode
- Saved presets (future)
- Custom dictionary (future)
- Batch cleanup (future)

## Local-First Privacy

متن شما به‌صورت پیش‌فرض در مرورگر پردازش می‌شود و برای پاک‌سازی و استانداردسازی نیازی به ارسال متن به سرور نیست.

All text processing happens in the browser. No text is sent to any server.

## Routes

- `/writing-tools` — Category landing page
- `/writing-tools/persian-writing-studio` — Main studio

## Tests

- Unit tests: normalization functions, stats, draft storage, feature gates
- E2E tests: full user flow, RTL, mobile, local-first network verification
