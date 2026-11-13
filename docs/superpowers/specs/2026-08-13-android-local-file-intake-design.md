# Android Local File Intake Design

## Goal

Deliver the first usable Android document workflow: a user selects a local PDF,
the app presents safe metadata, and the selection remains local to the device.

## Scope

`DocumentSelection` is a pure domain value containing only display-safe file
metadata: name, byte count, and MIME type. `DocumentSelectionPolicy` validates
the Android picker result before it reaches the UI: PDFs are accepted, a blank
name is replaced with a Persian-safe fallback, and unsupported MIME types are
rejected. The Compose app invokes `OpenDocument` with the PDF MIME filter and
renders either the selected metadata or a clear local-only empty state.

This slice deliberately does not read document bytes, create a PDF, request
storage permissions, upload data, scan with the camera, or share files. Those
behaviours need separate adapter and runtime evidence.

## Boundaries and Errors

The Android app owns picker wiring and UI state. The `feature:home` module owns
the pure policy and presentational state, making the security-sensitive
accept/reject rules JUnit-testable without Android framework mocks. A cancelled
or invalid picker result leaves the prior UI state unchanged; rejection is
represented as a Persian message rather than exposing a URI or filesystem path.

## Verification

Unit tests prove PDF acceptance, fallback naming, unsupported-type rejection,
and no retained URI. Android gates remain: architecture/privacy verification,
unit tests, lint, debug assembly, and release assembly with JDK 17. Runtime
picker evidence requires an available API 36 emulator or authorized device.
