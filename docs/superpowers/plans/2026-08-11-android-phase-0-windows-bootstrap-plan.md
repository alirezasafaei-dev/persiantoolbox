# Android Phase 0 Windows Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare and verify a reproducible Windows 11 development environment for the PersianToolbox native Android workspace without starting product implementation.

**Architecture:** Windows is the canonical Android build host, Android Studio supplies the SDK and JDK, Codex runs natively against the Git checkout, and OpenCode is an optional independent reviewer inside WSL2. The worker records sanitized evidence in Git; credentials, machine identifiers, and raw environment dumps stay local.

**Tech Stack:** Windows 11, PowerShell 7/Windows PowerShell, Git, GitHub CLI, Node.js LTS, Codex CLI, Android Studio stable, Android SDK 36, ADB, WSL2, optional OpenCode.

## Global Constraints

- Do not create the Android Gradle workspace or modify application code in Phase 0.
- Do not require Google Play Services, Firebase, a paid API, or a foreign payment method.
- Never print, read, copy, or commit tokens, passwords, signing keys, credential files, serial numbers, usernames, or absolute home-directory paths.
- Install only missing prerequisites and prefer official installers or `winget` packages.
- Keep Codex sandboxed to the repository; do not enable permanent full access.
- Stop for human action when Windows restart, UAC, browser authentication, Android Studio UI, BIOS/UEFI, or USB trust is required.
- Every committed change requires DCO sign-off.
- Deployment is forbidden.

---

## File Map

- `docs/android/agent-missions/phase-0-windows-bootstrap.md`: authoritative worker instructions and acceptance gate.
- `docs/android/agent-reports/phase-0-windows-bootstrap-template.md`: sanitized evidence contract returned by the Windows worker.
- `docs/android/agent-missions/README.md`: operating model, model routing, trust boundary, and handoff rules.
- `docs/guides/android-windows-setup.md`: human-readable installation reference.
- `docs/product/android-documents-roadmap.md`: phase ordering and links to the executable mission.

### Task 1: Inspect and protect the workstation

**Files:**

- Read: `docs/android/agent-missions/phase-0-windows-bootstrap.md`
- Create from template: `docs/android/agent-reports/phase-0-windows-bootstrap.md`

**Interfaces:**

- Consumes: a Windows 11 workstation and the repository URL from the mission.
- Produces: a preflight inventory containing only tool presence/version and pass/fail status.

- [ ] **Step 1: Confirm the operating boundary**

Run from a normal PowerShell window:

```powershell
$PSVersionTable.PSVersion
$windowsBuild = [System.Environment]::OSVersion.Version.Build
if ($windowsBuild -lt 22000) { throw 'Windows 11 build 22000 or newer is required.' }
'windows-11: supported'
winget --version
```

Expected: PowerShell responds, the Windows build is 22000 or newer, and `winget` is available. Record only `windows-11: supported` and the short `winget` version; do not include the full `$PSVersionTable` or environment variables in the report.

- [ ] **Step 2: Inspect existing tools without changing them**

```powershell
$commands = 'git','gh','node','npm','codex','adb','sdkmanager','java','wsl'
foreach ($command in $commands) {
  $found = Get-Command $command -ErrorAction SilentlyContinue
  "{0}: {1}" -f $command, $(if ($found) { 'present' } else { 'missing' })
}
```

Expected: one `present` or `missing` result per command, with no credential or environment dump.

- [ ] **Step 3: Record blockers before mutation**

Copy `docs/android/agent-reports/phase-0-windows-bootstrap-template.md` to the report path and record missing tools and any required restart/UAC/UI action. Do not mark a gate passed yet.

### Task 2: Install the supported toolchain

**Files:**

- Modify: `docs/android/agent-reports/phase-0-windows-bootstrap.md`

**Interfaces:**

- Consumes: preflight inventory from Task 1.
- Produces: Git, GitHub CLI, Node.js LTS, Codex, Android Studio/SDK, and optional WSL/OpenCode availability.

- [ ] **Step 1: Install only missing base tools**

Use the exact package commands in `docs/guides/android-windows-setup.md`, including the free OpenJDK 17 package used by command-line checks. After each installer, open a new PowerShell window before declaring the command missing.

- [ ] **Step 2: Authenticate interactively without exposing secrets**

Run `gh auth login` and the first `codex` login interactively. Record only `authenticated` or `not authenticated`; never record account handles, tokens, or configuration file contents.

- [ ] **Step 3: Complete Android Studio setup**

Use the Setup Wizard and SDK Manager to install Platform 36, Build-Tools 36.0.0, Platform-Tools, Command-line Tools, and Emulator. Select the embedded JDK compatible with the future Gradle build. Record component versions, not local SDK paths.

- [ ] **Step 4: Prepare test targets**

Create one API 36 emulator and connect one physical Android device when available. A missing physical device is a documented blocker because camera validation cannot be completed with an emulator alone.

- [ ] **Step 5: Install optional independent reviewer**

Install WSL2 Ubuntu and OpenCode only if they can be configured without a paid provider. If no free/available provider exists, mark OpenCode `blocked-optional`; it must not block the Android build environment.

### Task 3: Verify, report, and hand off

**Files:**

- Modify: `docs/android/agent-reports/phase-0-windows-bootstrap.md`
- Do not modify: application source, `android/`, deployment files, secrets, or global policy files.

**Interfaces:**

- Consumes: installed toolchain from Task 2.
- Produces: an evidence-backed Phase 0 verdict and a reviewable Git commit.

- [ ] **Step 1: Run the complete Doctor gate**

Run every command listed under `Final verification gate` in the mission. Capture short version lines and pass/fail results only.

- [ ] **Step 2: Check repository integrity**

```powershell
git status --short --branch
git diff --check
git diff --name-only
```

Expected: only the Phase 0 report is new or modified. If any other path changed, stop and restore only worker-owned accidental changes without touching pre-existing user work.

- [ ] **Step 3: Complete the report verdict**

Set the result to exactly one of `PASS`, `PASS_WITH_OPTIONAL_BLOCKER`, or `BLOCKED`. Every failed required gate must have the exact failing command, a concise error, and the smallest human action needed.

- [ ] **Step 4: Commit the evidence**

```powershell
git add docs/android/agent-reports/phase-0-windows-bootstrap.md
git commit -s -m "docs(android): record Windows phase 0 environment"
```

Expected: one signed-off commit containing only the sanitized report. Do not push; publication belongs to a separate owner-controlled mission after independent review.

- [ ] **Step 5: Return the handoff**

Return branch, commit SHA, report path, required-gate verdict, optional blockers, and human actions. Do not claim Phase 0 passed when `adb devices` has no usable target or any required Doctor command failed.
