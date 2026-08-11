# Android Persian Documents App — Design Specification

**Status:** Ready for owner review

**Date:** 2026-08-11

## Product decision

PersianToolbox will build a native, offline-first Android document scanner and
PDF toolkit. Version 1.0 is free, contains no ads or account system, and does not
require a backend. Its differentiator is a Persian RTL experience, offline
Persian OCR, low friction, and no document upload.

The Android code lives under `android/` in the existing monorepo. The first and
only initial application module is `:apps:documents`. Shared modules make a
future family of focused apps possible, but no second app is built without
market evidence.

## Approved scope

The MVP includes multi-page CameraX scanning, assisted/manual crop, perspective
correction, four image filters, page management, image-to-PDF, merge/split/
compress PDF, offline Persian/English OCR, recent documents, SAF export, and
Android sharing.

Cloud sync, login, payment, ads, vector PDF editing, Word conversion, digital
signature, automatic upload, and searchable RTL PDF are excluded from 1.0.

## Engineering design

The module graph, data flow, storage model, engine interfaces, dependency policy,
privacy rules, quality targets, and release strategy are normative in:

- `docs/technical/01-Architecture/04-android.md`
- `docs/product/android-documents-roadmap.md`
- `docs/guides/android-windows-setup.md`

Key architectural constraints are:

1. Native Kotlin/Compose; no wrapper as the product core.
2. `apps -> feature -> core/processing` dependency direction.
3. Third-party image, PDF, and OCR libraries hidden behind tested interfaces.
4. App-specific storage plus SAF export; no broad storage permission.
5. No `INTERNET` permission in MVP.
6. Stable, pinned, Maven Central/Google dependencies with compatible open-source
   licenses; no JitPack or dynamic versions.
7. Risk spikes for OpenCV, PdfBox-Android, and Tesseract4Android must pass release,
   memory, corrupt-input, cancellation, and ARM64 tests before product work grows.

## Failure behavior

All processing is cancellable and off the main thread. Library exceptions are
translated to stable domain error codes. Writes are temporary-and-atomic; a
crash, cancellation, full disk, malformed PDF, or process death must preserve the
last valid document state and original imports.

## Verification

The test pyramid includes unit and engine contract tests, Persian/English golden
fixtures, Room migration tests, instrumented SAF/CameraX/process-death tests, and
real-device performance runs. Release requires API 26/29/33/36 coverage, two real
device classes, no open P0/P1 defects, reproducible signed artifacts, license
notices, and a manual owner publishing decision.

## Acceptance

This design is accepted when the owner confirms these documents. The next step
is a detailed, test-driven implementation plan for Phase 1 only. Product code is
not started before that plan is reviewed.
