# Career Document Studio — Product Documentation

**Product name:** رزومه‌ساز حرفه‌ای (Career Document Studio)
**Version:** 1.0.0
**Last updated:** 2025-07-16

## Product Positioning

Career Document Studio is a practical, browser-based document-generation tool for creating professional resumes and cover letters. It is **NOT** career counseling, immigration advice, legal consultation, or a guarantee of employment. The tool helps users assemble and format information they already have into polished documents.

### Disclaimer (full Persian text)

> این ابزار صرفاً برای ساخت پیش‌نویس رزومه، کاورلتر و اسناد شغلی بر اساس اطلاعات واردشده توسط کاربر است و جایگزین مشاوره شغلی، مهاجرتی، حقوقی یا تضمین استخدام نیست. مسئولیت صحت اطلاعات، بررسی نهایی، ارسال و استفاده از خروجی بر عهده کاربر است.

## Why Quality Over Quantity

Rather than shipping dozens of shallow, single-purpose tools, Career Document Studio delivers one polished, production-ready product. The multi-step wizard, live preview, and export pipeline are designed to be genuinely useful — not just a checkbox feature.

## Implemented Document Types

| Type ID        | Title                     | Direction | Description                       |
| -------------- | ------------------------- | --------- | --------------------------------- |
| `resume-fa`    | رزومه فارسی               | RTL       | Persian resume with formal layout |
| `resume-en`    | رزومه انگلیسی             | LTR       | ATS-friendly English resume       |
| `cover-letter` | کاورلتر / نامه معرفی شغلی | RTL       | Professional cover letter         |

## Free vs Premium Model

| Feature                   | Free                             | Premium            |
| ------------------------- | -------------------------------- | ------------------ |
| Preview                   | ✅ In-browser                    | ✅ In-browser      |
| Local draft save          | ✅ Max 2 drafts                  | ✅ Unlimited (100) |
| Watermark on output       | ✅ "ساخته‌شده با PersianToolbox" | ❌ Clean output    |
| PDF export (print-to-PDF) | ❌                               | ✅                 |
| DOCX export               | ❌                               | ✅                 |
| Photo upload              | ❌                               | ✅ (resumes only)  |
| Advanced styling          | ❌                               | ✅                 |

Feature gates are defined in `lib/career-documents/schemas.ts` via `FEATURE_GATES`.

## Privacy & Local-First Behavior

- All data processing happens **in the browser**. No user data is sent to any server.
- Drafts are persisted in `localStorage` under the key `persian-tools.career-drafts.v1`.
- HTML rendering, DOCX generation, and print-to-PDF all run client-side.
- Privacy notice displayed to users:

> اطلاعات رزومه تا حد امکان در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.

## Data Model

### Core Types (`lib/career-documents/types.ts`)

- **`ResumeDraft`** — Top-level container. Contains document type, template ID, profile, all sections, and cover letter fields.
- **`ResumeProfile`** — Full name, email, phone, address, LinkedIn, GitHub, portfolio, photo (data URL), summary.
- **`ResumeExperience`** — Company, position, start/end dates, current flag, description.
- **`ResumeEducation`** — Institution, degree, field, start/end dates, description.
- **`ResumeSkill`** — Name + proficiency level (مبتدی / متوسط / پیشرفته / حرفه‌ای).
- **`ResumeLanguage`** — Name + proficiency level (مبتدی / متوسط / خوب / عالی / مادری).
- **`ResumeProject`** — Name, description, URL, technologies.
- **`ResumeCertification`** — Name, issuer, date, URL.

### Validation Functions

- `validateProfile()` — Requires full name; validates email format.
- `validateExperiences()` — Requires company and position for each entry.
- `validateCoverLetter()` — Requires sender name and body text.

## Export Behavior

### PDF (Print-to-PDF)

Opens a new window with the rendered HTML, then triggers the browser's print dialog. The user saves as PDF from the print dialog. Premium feature only.

### DOCX (via `docx` package)

Builds a Word document programmatically using the `docx` library. Handles RTL/LTR text direction, section headings with borders, bullet lists, date formatting (Persian/English), and the disclaimer footer. Premium feature only.

### HTML Download

Generates a standalone HTML file with embedded styles. Available to all users.

### Print

Opens the rendered document in a new window and triggers `window.print()`. Available to all users.

## Wizard Flow

### Resume Steps (12 steps)

1. Type selection → 2. Profile → 3. Summary → 4. Experience → 5. Education → 6. Skills → 7. Languages → 8. Projects → 9. Certifications → 10. Settings → 11. Preview → 12. Export

### Cover Letter Steps (6 steps)

1. Type selection → 2. Profile → 3. Summary (cover letter content) → 4. Settings → 5. Preview → 6. Export

Auto-save triggers 1 second after each change.

## SEO Pages

| Path                           | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| `/career-tools`                | Category landing page with FAQ, document type cards, disclaimer |
| `/career-tools/resume-builder` | Main studio page (dynamically loaded wizard)                    |

Both pages include:

- JSON-LD BreadcrumbList schema
- `<BreadcrumbSchema>` component
- Persian meta titles and descriptions
- FAQ section (landing page)

## File Structure

```
lib/career-documents/
  types.ts              — Types, constants, validation
  schemas.ts            — Document type definitions, feature gates
  calculations.ts       — Date formatting, Persian digits, empty creators
  render.ts             — HTML rendering (RTL/LTR, sections, watermark)
  draft-storage.ts      — localStorage CRUD for drafts
  export.ts             — HTML, PDF, DOCX export

components/features/career-documents/
  CareerWizard.tsx       — Main wizard orchestrator
  CareerTypeSelector.tsx — Document type picker
  ProfileForm.tsx        — Personal info form
  SectionEditor.tsx      — Reusable section editor (experience, education, skills, etc.)
  SummaryEditor.tsx      — Career summary textarea
  CoverLetterEditor.tsx  — Cover letter fields
  CareerPreview.tsx      — Live HTML preview

app/career-tools/
  page.tsx               — Category landing page
  resume-builder/page.tsx — Studio page

tests/unit/career-documents.test.ts — 55 unit tests
tests/e2e/career-documents.spec.ts — 11 E2E tests
```

## Tests Added

- **55 unit tests** covering types, schemas, calculations, rendering, draft storage, export, and validation.
- **11 E2E tests** covering the full wizard flow via Playwright.

## Production-Readiness Verdict

The Career Document Studio is **production-ready** for launch. All core features work end-to-end: wizard flow, live preview, HTML/PDF/DOCX export, draft persistence, free/premium feature gates, disclaimer enforcement, and SEO pages. The disclaimer is prominently displayed at export time and on the landing page. No server-side processing is required.

### Known Limitations (not blockers)

- PDF export relies on browser print dialog (UX varies by browser/OS).
- No cloud sync — drafts are device-local only.
- No AI writing suggestions or content assistance.
- Single template per document type (no style variations).
- No LinkedIn import or profile autofill.
