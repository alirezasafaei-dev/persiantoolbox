# Android Local File Intake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only PDF selection vertical slice to the Android documents app.

**Architecture:** The Home feature validates picker metadata in a pure Kotlin policy and exposes a tiny Compose state surface. The application module owns the Android Activity Result launcher, so the domain policy never stores a URI, document bytes, or Android Context.

**Tech Stack:** Kotlin, Jetpack Compose Material 3, AndroidX Activity Result API, JUnit 4, Gradle 8.13, JDK 17.

## Global Constraints

- Target JDK 17, minSdk 26, compileSdk and targetSdk 36.
- No `INTERNET`, broad storage permissions, document uploads, or document body persistence.
- Accept only `application/pdf`; picker filtering is defence in depth, policy validation is authoritative.
- Do not weaken lint, privacy, dependency-locking, or verification gates.

---

### Task 1: Pure selection policy

**Files:**
- Create: `android/feature/home/src/main/kotlin/ir/persiantoolbox/feature/home/DocumentSelectionPolicy.kt`
- Create: `android/feature/home/src/test/kotlin/ir/persiantoolbox/feature/home/DocumentSelectionPolicyTest.kt`

**Interfaces:**
- Produces: `data class DocumentSelection(val displayName: String, val sizeBytes: Long, val mimeType: String)`.
- Produces: `fun validateDocumentSelection(displayName: String?, sizeBytes: Long, mimeType: String?): Result<DocumentSelection>`.

- [x] **Step 1: Write failing tests** for accepted PDFs, blank-name fallback, and rejection of image MIME types.
- [x] **Step 2: Run** `gradlew.bat :feature:home:testDebugUnitTest` and confirm compilation fails because the policy is missing.
- [x] **Step 3: Implement** the minimal pure policy with exact MIME matching, non-negative size validation, and no URI parameter.
- [x] **Step 4: Re-run** `gradlew.bat :feature:home:testDebugUnitTest` and confirm all policy tests pass.

### Task 2: Picker UI wiring

**Files:**
- Modify: `android/feature/home/src/main/kotlin/ir/persiantoolbox/feature/home/HomeScreen.kt`
- Modify: `android/apps/documents/src/main/java/ir/persiantoolbox/documents/MainActivity.kt`
- Modify: `android/apps/documents/build.gradle.kts`

**Interfaces:**
- Consumes: `validateDocumentSelection(displayName, sizeBytes, mimeType)`.
- Produces: a `HomeScreen` callback requesting local PDF selection and a rendered `DocumentSelection` summary.

- [x] **Step 1: Write the state reducer test** that preserves selection on cancellation and replaces it only with valid metadata.
- [x] **Step 2: Run** the Home unit test and verify it fails due to the absent reducer.
- [x] **Step 3: Implement** the reducer, Home button/state, and `ActivityResultContracts.OpenDocument` launcher filtered to `application/pdf`.
- [x] **Step 4: Run** the focused Home unit test and inspect the manifest to confirm no permission was added.

### Task 3: Verification and handoff

**Files:**
- Modify: `android/README.md`

- [x] **Step 1: Document** local-only scope and API 36 runtime smoke steps.
- [x] **Step 2: Run** `verifyArchitecture verifyAndroidPrivacy test lint :apps:documents:assembleDebug :apps:documents:assembleRelease` with JDK 17.
- [x] **Step 3: Launch the API 36 emulator**, install the debug APK, and confirm the RTL local-only screen, picker launch, and cancellation return. Selection of a concrete PDF remains blocked because the emulator document provider is empty.
- [ ] **Step 4: Commit** only the vertical-slice files on `android/phase-1-local-files`.
