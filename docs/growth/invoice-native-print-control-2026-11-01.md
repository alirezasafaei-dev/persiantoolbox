# Native Chrome invoice text control - 2026-11-01

## Disposition

**Native-print control: FAIL for the tested mixed-text searches in PDFium. The owner requires the bug to be fixed; overall PDF acceptance remains FAIL and PR #245 remains Draft. Merge and deployment are not authorized.**

This is a bounded diagnostic continuation of the [reader compatibility checkpoint](invoice-reader-compatibility-2026-10-31.md). It changes no application source, dependency, export path, arithmetic, entitlement or privacy behavior.

## Control and evidence

A synthetic local HTML page used the existing Vazirmatn font and ordinary browser text. Latin identifiers, a word/number phrase and the site address were enclosed in standard `bdi dir="ltr"` elements within Persian sections. The page contained no customer data. It was served only on loopback, exposing the control and its single font asset.

The owner manually used Chrome's Save as PDF and saved the requested control file. The resulting PDF was independently found, copied to external evidence, parsed, rendered and visually inspected. It has one page, is 70,333 bytes, reports producer `Skia/PDF m156`, contains a structure tree and embeds subset Vazirmatn/Arial fonts. Its SHA-256 is `ccd50d98a013e7f44108f1a2eea8613674ea2bd7159aa1a69ec7348f0166cd8f`. The loopback service was stopped after inspection.

PDFium 156.0.8076.0 through pypdfium2 5.14.0 produced these exact-search results:

| Control value                                  | Search |
| ---------------------------------------------- | ------ |
| `INV-0003` beside its Persian label            | FAIL   |
| `React 19` inside the Persian description      | FAIL   |
| `PersianToolbox.ir` beside the Persian tagline | FAIL   |
| Persian lam-alef `لا`                          | FAIL   |
| Persian ZWNJ word `می‌رود`                     | FAIL   |
| Persian amount `۱۶۰٬۰۰۰`                       | PASS   |

Rendering shows readable values, while extraction returns reordered fragments such as `-0003INV`, `19 React` and `ir.PersianToolbox`. Secondary pypdf 6.10.0 extraction retains the three Latin values but fails the tested Persian ligature/joiner/amount checks. This demonstrates reader-dependent behavior; it is not native Chrome viewer copy/search verification of this new control. The prior owner-reported Chrome search result for the unchanged two-page control remains separate evidence.

## Consequence

The tested native-print path, including the presence of a structure tree and HTML bidi isolation, does not satisfy the mixed-text PDFium gate. It is not a demonstrated replacement for the current local download and must not be introduced as a claimed fix. This result does not establish that every PDF producer, tag structure, browser version or alternative layout will fail.

The owner briefly accepted a non-blocking reader limitation, then explicitly revoked that decision and required the bug to be fixed. No acceptance exception remains in effect. The unresolved reader defect remains a blocking item in the task plan. No unproven native-print path or new PDF engine is introduced. Further compatibility work requires successful reader evidence while preserving correct rendering and the existing local-only export contract. Merge and deployment require separate approval of a reviewed candidate.

## Hosted checkpoint

Verified on 2026-11-01: all 15 hosted checks succeeded on application candidate `321174fc3f41173e85a8f51faa5472de03c22b94`, including all four Chromium shards, quality, build, Lighthouse, strict security audit, contracts/licensing, enabled chat, CodeQL, smoke and readiness artifacts. These results belong to that exact commit; a later documentation commit is a separate head.

Live read-only version/health still reported `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`, healthy and ready. No production or search-ranking improvement is claimed.
