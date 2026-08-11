# Android Phase 0 Windows Environment Report

> Copy this file to `docs/android/agent-reports/phase-0-windows-bootstrap.md`. Do not add usernames, device serials, tokens, credential contents, or absolute personal paths.

## Metadata

- Mission ID: `android-phase-0-windows-bootstrap-v1`
- Started at (UTC):
- Completed at (UTC):
- Worker:
- Branch:
- Base SHA (before this mission):
- Verdict: `NOT_RUN`

## Required toolchain

| Check                           | Sanitized version/result          | Status (`PASS`/`FAIL`/`NOT_RUN`) |
| ------------------------------- | --------------------------------- | -------------------------------- |
| Windows 11 + `winget`           |                                   | `NOT_RUN`                        |
| Git                             |                                   | `NOT_RUN`                        |
| GitHub CLI                      |                                   | `NOT_RUN`                        |
| GitHub authentication           | authenticated/not authenticated   | `NOT_RUN`                        |
| Node.js LTS                     |                                   | `NOT_RUN`                        |
| npm                             |                                   | `NOT_RUN`                        |
| Codex CLI                       |                                   | `NOT_RUN`                        |
| Codex repository instructions   | `AGENTS.md` loaded/not loaded     | `NOT_RUN`                        |
| Android Studio stable           | version only                      | `NOT_RUN`                        |
| Android SDK Platform            | API level only                    | `NOT_RUN`                        |
| Build-Tools                     | version only                      | `NOT_RUN`                        |
| Platform-Tools / ADB            | version only                      | `NOT_RUN`                        |
| Command-line Tools / sdkmanager | version only                      | `NOT_RUN`                        |
| Java runtime                    | version only                      | `NOT_RUN`                        |
| API 36 emulator                 | booted/not booted                 | `NOT_RUN`                        |
| Real Android device             | authorized target present/missing | `NOT_RUN`                        |

## Optional reviewer

| Check                                   | Sanitized result           | Status (`PASS`/`BLOCKED_OPTIONAL`/`NOT_RUN`) |
| --------------------------------------- | -------------------------- | -------------------------------------------- |
| WSL2                                    | enabled/not enabled        | `NOT_RUN`                                    |
| OpenCode in WSL2                        | version or concise blocker | `NOT_RUN`                                    |
| Provider usable without foreign payment | usable/not available       | `NOT_RUN`                                    |

## Verification commands

| Command                        | Exit/result                     | Status    |
| ------------------------------ | ------------------------------- | --------- |
| Windows 11 build check         | supported/not supported         | `NOT_RUN` |
| `winget --version`             |                                 | `NOT_RUN` |
| `git --version`                |                                 | `NOT_RUN` |
| `gh --version`                 |                                 | `NOT_RUN` |
| sanitized GitHub auth check    | authenticated/not authenticated | `NOT_RUN` |
| `node --version`               |                                 | `NOT_RUN` |
| `npm --version`                |                                 | `NOT_RUN` |
| `codex --version`              |                                 | `NOT_RUN` |
| Codex instruction-source check | filenames only                  | `NOT_RUN` |
| `adb version`                  |                                 | `NOT_RUN` |
| `sdkmanager --version`         |                                 | `NOT_RUN` |
| `java -version`                |                                 | `NOT_RUN` |
| sanitized ADB target check     | present/missing                 | `NOT_RUN` |
| `git diff --check`             |                                 | `NOT_RUN` |

## Changes made

- Installed:
- Configured:
- Repository files changed: `docs/android/agent-reports/phase-0-windows-bootstrap.md` only / discrepancy:

## Blockers and human actions

| Required/optional | Blocker | Exact failing command or observation | Smallest next human action |
| ----------------- | ------- | ------------------------------------ | -------------------------- |
|                   |         |                                      |                            |

## Safety attestation

- [ ] No token, password, credential content, signing key, account handle, username, device serial, or personal absolute path was recorded.
- [ ] No application code, Android workspace, CI, deployment, or production service was changed.
- [ ] No paid API or foreign payment method was required.
- [ ] No push, PR, merge, or deployment was attempted.
- [ ] The report reflects actual executed commands; unrun checks remain `NOT_RUN`.

## Final handoff

- Required gates passed:
- Required gates failed:
- Optional blockers:
- Commit SHA or `not committed`:
- Recommended next action:
