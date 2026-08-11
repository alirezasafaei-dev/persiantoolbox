# Android Agent Missions

This directory contains bounded, versioned work packages for agents operating on the native Android project. Git is the source of truth; an agent narrative is not evidence by itself.

## Trust boundary

1. The architect creates or updates one mission with explicit allowed files and gates.
2. The worker uses a dedicated branch and changes only the declared scope.
3. The worker commits a sanitized report with DCO sign-off.
4. The architect independently checks the SHA, diff, commands, report, and CI/device evidence.
5. Rejected work receives a corrective mission. Approved work may proceed to PR/merge.

The existing automated control plane under `docs/growth/agent-loop/` remains responsible for server-side growth missions. Windows and physical-device missions stay here because they require interactive workstation access and must not be claimed by a Linux server worker.

## Model routing

Use the smallest sufficient model for each fresh Codex session. Model names depend on account availability; use `/model` to select the closest available tier and effort.

| Work                                                                 | Preferred route                         |
| -------------------------------------------------------------------- | --------------------------------------- |
| Installation inventory, formatting, report updates                   | `gpt-5.6-luna` with low effort          |
| Windows setup, dependency diagnosis, routine implementation          | `gpt-5.6-terra` with medium effort      |
| Android architecture, Gradle failures, camera/PDF/OCR implementation | `gpt-5.6-sol` with high effort          |
| Final security/architecture review                                   | `gpt-5.6-sol` with high or xhigh effort |

Do not use max/ultra effort by default. Escalate only after a concrete failure, ambiguity, or high-risk review justifies it.

## Worker rules

- Read the root `AGENTS.md`, the referenced design, roadmap, mission, and report template before acting.
- Inspect before installing or editing. Preserve pre-existing user changes.
- Never read or print credential stores, environment variables, tokens, keystores, device serials, or personal filesystem paths.
- Never deploy. Never create or rotate signing keys without a separate approved mission.
- Stop at a real human boundary such as restart, UAC, browser login, USB authorization, or BIOS configuration; provide one exact next action and continue after the user confirms.
- A report must label unrun checks as `NOT_RUN`, not `PASS`.

## Current mission

- [Phase 0 — Windows 11 bootstrap](phase-0-windows-bootstrap.md)
- [Phase 0 report template](../agent-reports/phase-0-windows-bootstrap-template.md)
