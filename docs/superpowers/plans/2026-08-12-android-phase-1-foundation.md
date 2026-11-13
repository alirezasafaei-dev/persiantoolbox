# Android Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a native offline-first Android foundation for PersianToolbox with a real Compose shell, stable domain contracts, privacy gates, and reproducible debug/release builds.

**Architecture:** `:apps:documents` owns navigation and the application manifest. Feature modules expose UI entry points and depend only on core/processing modules. Processing adapters depend on stable domain contracts and hide third-party APIs. The first implementation keeps risk-spike adapters deterministic and offline; any unavailable external engine is recorded as a bounded, explicit limitation rather than represented as a fake production result.

**Tech Stack:** Kotlin, Gradle Kotlin DSL, Android Gradle Plugin, Jetpack Compose Material 3, coroutines, JUnit, Android manifest/lint checks, JDK 17, minSdk 26 / compileSdk 36 / targetSdk 36.

---

### Task 1: Establish the isolated base and plan

**Files:**
- Create: `docs/superpowers/plans/2026-08-12-android-phase-1-foundation.md`
- Preserve: existing unrelated worktree changes

- [ ] Record base SHA, branch, clean/dirty state, available JDK/SDK/ADB/Gradle tools, and design source.
- [ ] Treat `docs/superpowers/specs/2026-08-11-android-documents-app-design.md` and the architecture/roadmap documents as acceptance criteria.
- [ ] Do not alter the existing bootstrap branch or its unrelated `tests/e2e/helpers/pwa.ts` change.

### Task 2: Create the Gradle workspace and convention policy

**Files:**
- Create: `android/settings.gradle.kts`, `android/build.gradle.kts`, `android/gradle.properties`, `android/gradle/libs.versions.toml`
- Create: `android/build-logic/settings.gradle.kts`, `android/build-logic/build.gradle.kts`, convention plugin sources
- Create: module `build.gradle.kts` files and source roots for all approved modules

- [ ] Pin every dependency in the version catalog; use only Google and Maven Central.
- [ ] Configure API levels, namespace policy, UTF-8, JDK 17, warnings, Compose, unit tests, lint, release shrinking, and dependency locking.
- [ ] Include every non-empty approved module and give each one a responsibility.
- [ ] Add an architecture verification task that rejects forbidden project dependency edges.
- [ ] Run `gradlew.bat --version`, `projects`, and the focused compile task; fix all nonzero failures before proceeding.

### Task 3: Define domain models and processing contracts test-first

**Files:**
- Create: `core/model/src/main/kotlin/.../Model.kt`, `core/model/src/test/kotlin/.../ModelTest.kt`
- Create: `core/common/src/main/kotlin/.../ProcessingContracts.kt`
- Create: `core/testing/src/main/kotlin/.../Fakes.kt`, contract tests

- [ ] Write failing tests for ranges, ordered pages, quadrilateral validation, OCR languages, cancellation, and stable error mapping.
- [ ] Implement immutable domain models without third-party types.
- [ ] Implement `ImageProcessor`, `PdfEngine`, and `OcrEngine` with suspend APIs, progress, cancellation, deterministic results, and domain errors.
- [ ] Implement configurable fakes and shared contract assertions.
- [ ] Run model/common/testing unit tests and the full host test task.

### Task 4: Implement privacy-safe file and manifest gates

**Files:**
- Create: `core/files/src/main/kotlin/.../DocumentFileStore.kt` and tests
- Create: app manifest, FileProvider paths, privacy verifier task/test
- Create: `scripts/verify-android-privacy.ps1` or equivalent Gradle task

- [ ] Write failing tests for atomic writes, rollback, cleanup idempotence, URI rejection, original preservation, and OUT_OF_SPACE mapping.
- [ ] Implement internal storage boundaries and SAF/FileProvider abstractions.
- [ ] Enforce no INTERNET, broad storage, tracking dependencies, exported ambiguity, and backup of document/OCR content.
- [ ] Run the privacy verifier against the merged release manifest.

### Task 5: Build the Persian RTL Compose shell test-first

**Files:**
- Create: `core/designsystem/...`
- Create: feature module UI entry points and tests
- Create: `apps/documents/src/main/...` and app tests

- [ ] Write failing UI tests for RTL, Persian labels, routes, unavailable-state behavior, dark mode, and accessibility semantics.
- [ ] Implement Material 3 theme, edge-to-edge activity, stable routes, Persian home screen, and explicit Phase 2 unavailable states.
- [ ] Compile and run available Compose/unit tests; reserve device-only tests for an attached target.

### Task 6: Add bounded offline adapters and evidence

**Files:**
- Create: processing image/pdf/ocr adapters and adapter tests
- Create: fixtures/evidence documentation

- [ ] Implement deterministic platform-backed PDF behavior and bounded image/OCR adapter boundaries.
- [ ] Keep third-party library types behind adapters and map failures to domain codes.
- [ ] Record actual dependency, license, artifact, R8, ABI, and benchmark evidence; do not invent measurements.
- [ ] Run adapter contract tests, release shrinking, and fixture checks.

### Task 7: CI, SBOM/NOTICE, documentation, and legacy truthfulness

**Files:**
- Create: `.github/workflows/android.yml`, NOTICE/SBOM metadata and verification tasks
- Modify: Android roadmap/setup/docs and root README only where evidence requires it
- Modify: legacy `mobile-app/` documentation to distinguish prototype from native product

- [ ] Add PR/workflow-dispatch gates for wrapper, projects, architecture/privacy, tests, lint, debug/release, verification, lock state, and artifacts.
- [ ] Generate/verify dependency NOTICE and machine-readable SBOM without secrets or executables.
- [ ] Document exact Windows/offline/device commands and limitations.
- [ ] Run affected repository checks and inspect the complete diff.

### Task 8: Independent review, commit, push, PR, and bounded backlog

**Files:**
- Create: bounded Phase 1/Phase 2 mission files using the repository mission schema
- Modify: control-plane documentation only on the Android branch where necessary

- [ ] Review security/privacy, dependency direction, test quality, generated artifacts, secrets, permissions, and signed-off commits.
- [ ] Commit logical changes with Conventional Commits and DCO sign-off.
- [ ] Push only `android/phase-1-foundation`; create a Draft PR and record actual commands/exit codes.
- [ ] Seed idempotent, one-branch-per-mission Android backlog items; do not include signing, publishing, deployment, or merge.
- [ ] Inspect the scheduled supervisor and trigger one cycle if the local task exists; report exact blocker otherwise.

### Self-review checklist

- [ ] Every design requirement maps to a task or is explicitly recorded as a machine/device/external blocker.
- [ ] No placeholder/TBD/TODO language is used as an acceptance substitute.
- [ ] Domain signatures remain consistent across adapters, fakes, and tests.
- [ ] Dependency direction is enforced by executable verification.
- [ ] API 26–36, no INTERNET/broad storage, offline behavior, and Windows commands are covered.
- [ ] No completion claim is made without fresh command evidence.
