# Mission: Android Phase 0 — Windows 11 Bootstrap

**Mission ID:** `android-phase-0-windows-bootstrap-v1`

**Status:** ready for a human-supervised Windows worker

**Recommended worker:** Codex with `gpt-5.6-terra`, medium reasoning

## Objective

Prepare and verify the Windows 11 workstation for native Android development of the PersianToolbox documents app. This mission ends with a sanitized, committed environment report. It does not create the Android project and does not implement product code.

## Required reading

Read these files completely before running installation commands:

1. `AGENTS.md`
2. `docs/guides/android-windows-setup.md`
3. `docs/product/android-documents-roadmap.md`
4. `docs/technical/01-Architecture/04-android.md`
5. `docs/android/agent-reports/phase-0-windows-bootstrap-template.md`

## Repository setup

Use `C:\dev\persiantoolbox` as the default checkout. If the repository is absent, create `C:\dev`, clone `https://github.com/alirezasafaei-dev/persiantoolbox.git`, and enter it. If it exists, preserve local work, fetch, and report divergence before changing branches.

Create branch `android/phase0-windows-bootstrap` from the remote default branch only when the working tree is clean. If it is not clean, stop and show the user the path list without printing file contents.

## Allowed changes

- Create `docs/android/agent-reports/phase-0-windows-bootstrap.md` from the template.
- Install missing workstation prerequisites described by the setup guide.
- Configure Git identity only after asking the owner for the exact public name/email.
- Configure Codex permissions for the repository directory only.

## Forbidden changes

- Do not create or modify `android/`, application code, web code, deployment files, CI, production services, secrets, signing keys, global security policy, or GitHub branch protection.
- Do not enable permanent full filesystem access for Codex.
- Do not use a paid API, require a foreign payment method, or add Firebase/Google Play Services.
- Do not run destructive cleanup or overwrite user changes.
- Do not print or commit tokens, passwords, credential-file contents, environment dumps, account handles, usernames, device serials, or absolute personal paths.
- Do not push, open a PR, merge, or deploy. Those actions require a separate owner-controlled mission after independent review.

## Execution protocol

1. Run a read-only inventory before installing anything.
2. Install only missing required tools using the setup guide and official sources.
3. Pause for the user when restart, UAC, browser authentication, Android Studio UI, BIOS/UEFI, or USB trust is required. Continue from the next unchecked item after confirmation.
4. Prefer Android builds in native Windows. Use WSL2 only for optional OpenCode review.
5. Treat OpenCode as optional. If it requires an unavailable paid provider, record `blocked-optional` and continue.
6. Use a real Android device for the camera-readiness gate. An emulator alone is insufficient.
7. Copy the report template, fill it with sanitized evidence, run repository integrity checks, and commit only the report with DCO sign-off.

## Final verification gate

Run from PowerShell in the repository unless noted. Record concise output; never paste credential details or a device serial.

```powershell
$windowsBuild = [System.Environment]::OSVersion.Version.Build
if ($windowsBuild -lt 22000) { throw 'Windows 11 build 22000 or newer is required.' }
'windows-11: supported'
winget --version
git --version
gh --version
gh auth status *> $null
if ($LASTEXITCODE -eq 0) { 'github-auth: authenticated' } else { 'github-auth: not authenticated'; exit 1 }
node --version
npm --version
codex --version
codex --ask-for-approval never exec "Read the active repository instructions and return only their source filenames. Do not edit files."
adb version
sdkmanager --version
java -version
git status --short --branch
git diff --check
```

Verify targets without recording identifiers:

```powershell
$usable = adb devices | Select-String "\tdevice$"
if ($usable) { "adb-target: present" } else { "adb-target: missing" }
```

Only if OpenCode is configured, run `wsl --status` in PowerShell. Then run the remaining checks inside Ubuntu:

```powershell
wsl --status
```

```bash
opencode --version
git --version
test -f /mnt/c/dev/persiantoolbox/AGENTS.md && echo repository-ok
```

## Acceptance criteria

- Windows 11 build 22000 or newer and `winget` are available.
- Git, GitHub CLI, Node.js LTS, npm, and Codex are executable.
- `gh auth status` succeeds; record only `authenticated` or `not authenticated`, never its account handle or token details.
- Android Studio stable and SDK Platform 36, Build-Tools 36.0.0, Platform-Tools, Command-line Tools, and Emulator are installed.
- `adb`, `sdkmanager`, and a Gradle-compatible JDK 17+ are executable; Android Studio is configured to use its embedded runtime.
- At least one API 36 emulator boots and at least one real Android device is authorized for ADB; if the real device is unavailable, the mission is `BLOCKED`, not passed.
- Codex loads the repository `AGENTS.md` and remains sandboxed to the project.
- OpenCode is verified in WSL2 or reported as `blocked-optional` with no impact on the required gate.
- The only repository change is `docs/android/agent-reports/phase-0-windows-bootstrap.md`.
- The report contains actual command results, no secrets or personal identifiers, and a final verdict.
- The report is committed with `git commit -s` and the worker returns the full commit SHA.

## Completion response

Return exactly:

1. verdict: `PASS`, `PASS_WITH_OPTIONAL_BLOCKER`, or `BLOCKED`;
2. branch and full commit SHA, or `not committed` with reason;
3. report path;
4. required gates passed/failed;
5. optional blockers;
6. pending human actions;
7. confirmation that no push, PR, merge, deploy, secret access, or product-code change occurred.
