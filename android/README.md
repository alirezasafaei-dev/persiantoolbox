# PersianToolbox Android

Native Kotlin/Compose foundation for «جعبه‌ابزار اسناد فارسی».

The workspace targets JDK 17, minSdk 26, compileSdk/targetSdk 36, and uses only
Google and Maven Central repositories. The MVP manifest intentionally has no
`INTERNET` or broad-storage permission. Documents and OCR content remain local.

## Windows build

From `android/`:

```powershell
.\gradlew.bat --version
.\gradlew.bat projects
.\gradlew.bat test lint :apps:documents:assembleDebug :apps:documents:assembleRelease
.\gradlew.bat dependencyVerification
```

Engineering APKs are emitted under `apps/documents/build/outputs/apk/`. No
production signing key is included or required for the unsigned release gate.

The current foundation includes the Persian RTL shell, stable domain models,
processing interfaces, privacy checks, and module boundaries. CameraX/OpenCV/
PdfBox/Tesseract risk spikes remain bounded adapter work and must not be
described as completed product functionality until their fixture and release
evidence exists.

## Local PDF intake

The Home screen can request one local PDF through Android's system document
picker. The app retains only its display name, byte size, and MIME type for
the current UI session; it does not upload, copy, or persist document content
and it requests no storage permission. Cancelling a later picker request keeps
the existing selection visible.

For API 36 runtime smoke evidence, install the debug APK, tap «انتخاب فایل
PDF», select a PDF, confirm its name and size are shown, then cancel another
picker request and confirm the previous selection remains. This manual step
requires an available emulator or an authorized device.

## Current host evidence

The repository includes the official Gradle 8.13 wrapper. With JDK 17 and the
current TUN network path, the Android policy checks, tests, lint, and unsigned
debug/release APK builds complete locally. API 36 emulator launch is recorded
separately from those build gates; a physical authorized device remains needed
for camera validation.
