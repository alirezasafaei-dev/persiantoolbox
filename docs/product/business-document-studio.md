# Business Document Studio — Product Specification

## Overview

**استودیوی اسناد کسب‌وکار** — a practical document-generation tool for Persian-speaking businesses.

This tool is ONLY:

- A draft/document generator based on user-entered information
- A tool for creating printable business documents (PDF, Word)
- A local-first privacy-respecting document builder

This tool is NOT:

- Accounting software
- Tax advisory
- Legal advice or official document
- Financial audit tool
- Government filing system

## Why Quality Over Quantity

One polished product instead of many shallow tools. The Business Document Studio focuses on three core document types with a professional, polished workflow rather than rushing to cover every possible business document.

## Implemented Document Types

| Document Type | Persian Name    | Prefix | Description                                                      |
| ------------- | --------------- | ------ | ---------------------------------------------------------------- |
| `invoice`     | فاکتور فروش     | INV    | سند رسمی فروش کالا یا خدمات با اطلاعات فروشنده و خریدار          |
| `proforma`    | پیش‌فاکتور      | PRO    | پیش‌نویس فاکتور برای اعلام قیمت و شرایط قبل از صدور فاکتور نهایی |
| `receipt`     | رسید دریافت وجه | REC    | تأییدیه دریافت وجه از خریدار یا طرف قرارداد                      |

## User Flow (6-Step Wizard)

1. `/business-tools` — Category landing page with document type selection
2. `/business-tools/document-studio` — Main studio page
3. Step 1: Select document type (invoice / proforma / receipt)
4. Step 2: Seller party form (name, national ID, phone, email, address)
5. Step 3: Buyer party form (name, national ID, phone, email, address)
6. Step 4: Line items editor (description, quantity, unit price, unit)
7. Step 5: Document settings (discount %, tax %, notes, footer, document number/date)
8. Step 6: Live preview with export options

## Free vs Premium Model

### Free Tier

- Live preview in browser
- Local draft save (up to 3 drafts per document type)
- Text preview with watermark "ساخته‌شده با PersianToolbox"
- Disclaimer shown on all outputs
- No PDF/DOCX export
- No custom logo

### Premium Tier (feature-flagged)

- Clean PDF export (print-to-PDF)
- DOCX export (via `docx` package)
- Custom logo support
- Unlimited drafts (100)
- No watermark

### Feature Gates

```typescript
// lib/business-documents/schemas.ts
{
  free: {
    canExportPdf: false,
    canExportDocx: false,
    canUseLogo: false,
    canSaveDraft: true,
    maxDrafts: 3,
    hasWatermark: true,
  },
  premium: {
    canExportPdf: true,
    canExportDocx: true,
    canUseLogo: true,
    canSaveDraft: true,
    maxDrafts: 100,
    hasWatermark: false,
  },
}
```

## Local-First / Privacy Behavior

- All data processed in browser via JavaScript
- No server sends for document generation
- Drafts stored in `localStorage` under key `persian-tools.business-drafts.v1`
- Privacy text displayed in UI: "اطلاعات سند تا حد امکان در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست."
- No cookies, no analytics tracking of document content

## Data Model

### Core Types (`lib/business-documents/types.ts`)

```typescript
BusinessDocumentDraft {
  id: string;
  documentType: 'invoice' | 'proforma' | 'receipt';
  createdAt: string;
  updatedAt: string;
  seller: BusinessParty;
  buyer: BusinessParty;
  items: BusinessLineItem[];
  notes?: string;
  documentNumber?: string;
  documentDate?: string;
  discountPercent?: number;
  taxPercent?: number;
  footer?: string;
  logoDataUrl?: string;
  templateId: string;
}

BusinessParty {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  registrationNo?: string;
  economicCode?: string;
}

BusinessLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

BusinessDocumentTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
}
```

## Export Behavior

### PDF Export

- Opens a new browser window with the rendered HTML
- Triggers `window.print()` after 300ms delay
- User saves as PDF via the browser's print dialog
- No server-side PDF generation

### DOCX Export

- Uses the `docx` package to build a native `.docx` file
- Includes document title, party info, line items table, totals, notes, and disclaimer
- Downloads via `Blob` + `URL.createObjectURL()`
- Persian digits converted throughout

## Validation

### Party Validation (`validateParty`)

- Name: required (non-empty trimmed string)
- National ID: optional, must be exactly 10 digits
- Phone: optional, must match `^0\d{10}$`
- Email: optional, must be valid email format

### Item Validation (`validateItems`)

- At least one item required
- Each item: description required, quantity > 0, unitPrice > 0

## Disclaimer (Full Persian Text)

> این ابزار صرفاً برای ساخت پیش‌نویس و خروجی قابل ویرایش اسناد کسب‌وکار بر اساس اطلاعات واردشده توسط کاربر است و جایگزین نرم‌افزار حسابداری، مشاوره مالیاتی، مشاوره حقوقی یا سند رسمی نیست. مسئولیت صحت اطلاعات، بررسی نهایی، چاپ، ارسال و استفاده از خروجی بر عهده کاربر است.

## SEO Pages

- `/business-tools` — Category landing page with FAQ, BreadcrumbList JSON-LD
- `/business-tools/document-studio` — Main studio page with BreadcrumbList JSON-LD
- Keywords: فاکتور ساز آنلاین, پیش فاکتور ساز, رسید ساز, ساخت فاکتور PDF

## File Structure

```
lib/business-documents/
  types.ts           — Types, DISCLAIMER, PRIVACY_TEXT, validation functions
  schemas.ts         — Document types, feature gates, constants
  calculations.ts    — Totals calculator, Persian digits, date formatting, Jalali conversion
  render.ts          — HTML rendering for print/PDF (RTL, Vazirmatn font)
  draft-storage.ts   — localStorage draft persistence (CRUD + count)
  export.ts          — PDF (print-to-PDF) + DOCX (docx package) export

components/features/business-documents/
  DocumentStudio.tsx         — Main wizard orchestrator (6-step flow)
  DocumentTypeSelector.tsx   — Step 1: document type selection cards
  PartyForm.tsx              — Steps 2-3: seller/buyer party forms
  LineItemsEditor.tsx        — Step 4: line items CRUD with totals
  DocumentPreview.tsx        — Step 6: live preview + export buttons

app/business-tools/
  page.tsx                   — Category landing page (SSR)
  document-studio/
    page.tsx                 — Main studio page (dynamic import, SSR false)
```

## Tests

### Unit Tests: 54 tests (`tests/unit/business-documents.test.ts`)

| Category      | Tests | Coverage                                                                                             |
| ------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Calculations  | 12    | calculateTotals, generateDocumentNumber, toPersianDigits, formatCurrency, toJalali, getDocumentTitle |
| Validation    | 14    | validateParty (name, nationalId, phone, email), validateItems (empty, description, quantity, price)  |
| Schemas       | 5     | DOCUMENT_TYPES, FEATURE_GATES, FREE_MAX_DRAFTS                                                       |
| Render        | 8     | HTML output, seller/buyer labels, watermark, disclaimer, receipt type labels                         |
| Draft Storage | 7     | saveDraft/loadDrafts round-trip, deleteDraft, canSaveDraft limit, createDraftId                      |
| Export        | 1     | isDocxAvailable                                                                                      |

### E2E Tests: 13 tests (`tests/e2e/business-documents.spec.ts`)

- Page load tests for /business-tools and /business-tools/document-studio
- Form interaction: select type, fill seller, fill buyer, add line items
- UI verification: live preview, mobile viewport, RTL layout, disclaimer
- Export verification: export buttons present, DOCX premium gating
- Accessibility: keyboard navigation (Tab)

## Production Readiness

- [x] Types fully defined with validation
- [x] Local-first privacy (no server sends)
- [x] Free/Premium feature gates
- [x] Professional HTML rendering with RTL support
- [x] DOCX export with docx package
- [x] PDF export via print-to-PDF
- [x] localStorage draft persistence
- [x] Persian digit conversion throughout
- [x] Jalali date conversion
- [x] 54 unit tests passing
- [x] 13 E2E tests
- [x] SEO metadata + JSON-LD
- [x] RTL layout
- [x] Dark mode support via CSS variables
- [x] Disclaimer on all outputs
- [x] Mobile responsive
