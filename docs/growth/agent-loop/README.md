# Agent Control Plane — PersianToolbox

**Version**: 2.0
**Created**: 2026-08-08
**Updated**: 2026-08-08 (Phase 2.9 — real executor activated)
**Status**: Active — real executor verified with canary mission
**Scope**: §29-36 — GitHub-based durable control plane for autonomous agent execution

---

## 1. Overview

The Agent Control Plane is the durable, GitHub-based coordination layer for autonomous agent execution on PersianToolbox. It turns GitHub into the source of truth for **what work exists**, **who is doing it**, **what state it is in**, and **what evidence proves it is done**.

### Implementation Status

| Component        | Status      | File                                          |
| ---------------- | ----------- | --------------------------------------------- |
| Types            | ✅ Complete | `scripts/growth/agent-loop/types.ts`          |
| State Store      | ✅ Complete | `scripts/growth/agent-loop/state-store.ts`    |
| Mission Loader   | ✅ Complete | `scripts/growth/agent-loop/mission-loader.ts` |
| Lease Manager    | ✅ Complete | `scripts/growth/agent-loop/lease.ts`          |
| Report Generator | ✅ Complete | `scripts/growth/agent-loop/report.ts`         |
| Git Persistence  | ✅ Complete | `scripts/growth/agent-loop/git-persist.ts`    |
| Real Executor    | ✅ Complete | `scripts/growth/agent-loop/executor.ts`       |
| Orchestrator     | ✅ Complete | `scripts/growth/agent-loop/orchestrator.ts`   |
| CLI              | ✅ Complete | `scripts/growth/agent-loop/index.ts`          |
| Canary Mission   | ✅ Verified | `mission-control-plane-canary`                |

### Why GitHub?

- **Durable**: commits, issues, and files survive crashes, restarts, and lost sessions.
- **Auditable**: every state transition is a commit with a `Signed-off-by` trailer.
- **Conflict-free**: the claim/lease system prevents two agents from executing the same mission.
- **Reviewable**: humans review missions and results through the same PR/issue flow they already use.

### Core Principles (§29)

1. **GitHub is the durable control plane** — no in-memory state, no local-only coordination.
2. **One active mission at a time** — the control plane serializes execution.
3. **Claim/lease system prevents conflicts** — a mission is claimed before execution and released on completion, failure, or timeout.
4. **Every mission has acceptance criteria** — a mission without criteria cannot be verified and must not be claimed.
5. **Every completion has verification evidence** — typecheck, lint, tests, and build results are recorded in the report.
6. **Failed missions retry up to `maxAttempts`** — then the mission is marked failed and archived.
7. **Archived missions are immutable** — once moved to `archive/`, a mission file is never modified.

### Real Executor

The control plane uses `opencode run` as the real executor:

```bash
opencode run "<mission prompt>" --auto --dir <project-root> --format json
```

- `--auto` flag enables non-interactive execution
- `--format json` provides structured output
- Executor runs in the project root directory
- Every execution creates a git commit with the changes

### Directory Layout

```
docs/growth/agent-loop/
├── README.md              # This file — control plane documentation
├── state.json             # Current agent state (single source of truth for status)
├── missions/              # Mission definitions (one file per mission)
│   ├── .gitkeep
│   ├── _template.json     # Mission file template
│   └── mission-*.json     # Active mission files
├── reports/               # Execution reports (one file per completed attempt)
│   ├── .gitkeep
│   ├── _template.json     # Report file template
│   └── mission-*.json     # JSON reports
│   └── mission-*.md       # Markdown reports
├── canary/                # Canary verification files
│   └── <timestamp>.md     # Canary proof files
├── reviews/               # Human review results
│   └── .gitkeep
└── archive/               # Completed/failed missions (immutable)
    └── .gitkeep
```

---

## 2. State Machine (§30)

```
                    ┌──────────────────────────────────────────────┐
                    │                                              │
                    v                                              │
   ┌─────────┐   new mission file   ┌──────────────┐   read+claim  ┌─────────┐
   │  IDLE   │ ───────────────────▶ │ NEW_MISSION  │ ─────────────▶ │ CLAIMED │
   └─────────┘                      └──────────────┘               └─────────┘
        ▲                                                               │
        │                                                               │ start execution
        │                                                               v
        │                                                          ┌─────────┐
        │                                                          │ RUNNING │
        │                                                          └─────────┘
        │                                                               │
        │                                                               │ execution
        │                                                               │ completes
        │                                                               v
        │                                                          ┌───────────┐
        │                                                          │ VERIFYING │
        │                                                          └───────────┘
        │                                                               │
        │                                                               │ verification
        │                                                               │ passes
        │                                                               v
        │                                                          ┌───────────┐
        │                                                          │ COMPLETED │
        │                                                          └───────────┘
        │                                                               │
        │                                                               │ human review
        │                                                               v
        │                                                          ┌───────────┐
        │                                                          │ REVIEWED  │
        │                                                          └───────────┘
        │                                                               │
        │                                                               │ archive mission
        │                                                               v
        │                                                          ┌───────────┐
        └──────────────────────────────────────────────────────────│   IDLE    │
                                                                   └───────────┘
```

### Transitions

| From        | To          | Trigger                                                                                        |
| ----------- | ----------- | ---------------------------------------------------------------------------------------------- |
| IDLE        | NEW_MISSION | A new mission file appears in `missions/`                                                      |
| NEW_MISSION | CLAIMED     | An agent reads and claims the mission (writes `claimedAt`, `claimedBy`, `status: "claimed"`)   |
| CLAIMED     | RUNNING     | The agent starts execution (writes `status: "running"`)                                        |
| RUNNING     | VERIFYING   | Execution completes; agent runs verification suite                                             |
| VERIFYING   | COMPLETED   | Verification passes; report written to `reports/`                                              |
| VERIFYING   | RUNNING     | Verification fails; agent increments `attempts` and retries (up to `maxAttempts`)              |
| COMPLETED   | REVIEWED    | A human reviews the report and approves                                                        |
| REVIEWED    | IDLE        | Mission moved to `archive/`; `state.json` reset                                                |
| Any state   | IDLE        | Error or timeout (lease expiry); mission released back to `missions/` with `status: "pending"` |

### Lease / Timeout Rules

- A mission is **leased** when claimed. The lease expires after `heartbeatIntervalMs` (default 300000 ms / 5 min) without a heartbeat.
- Heartbeats are recorded by updating `state.json` (`lastHealthCheck`) and the mission file (`status` stays `running`).
- On lease expiry, the mission returns to `pending` and any other agent may claim it. `attempts` is **not** incremented on lease expiry — only on verification failure.

---

## 3. How to Create Missions

### 3.1 Mission File

Copy `missions/_template.json` to `missions/mission-<timestamp>.json` and fill it in:

```json
{
  "id": "mission-20260808-000000",
  "type": "growth",
  "priority": "high",
  "title": "Add UTM tracking to homepage role cards",
  "description": "Wire onClick handlers to the three homepage role-based paths so funnel analytics capture role selection.",
  "acceptanceCriteria": [
    "Homepage role cards fire a tool_complete/role_select event with UTM params",
    "No hydration errors on the homepage",
    "typecheck, lint, vitest, and build all pass"
  ],
  "files": ["components/home/RoleCard.tsx", "lib/analytics/track.ts"],
  "createdAt": "2026-08-30T00:00:00Z",
  "claimedAt": null,
  "completedAt": null,
  "status": "pending",
  "claimedBy": null,
  "attempts": 0,
  "maxAttempts": 3
}
```

### 3.2 Field Reference

| Field                | Required | Description                                                                            |
| -------------------- | -------- | -------------------------------------------------------------------------------------- |
| `id`                 | yes      | Unique mission id, format `mission-<timestamp>`                                        |
| `type`               | yes      | `growth` \| `product` \| `content` \| `seo` \| `ops` \| `fix`                          |
| `priority`           | yes      | `high` \| `medium` \| `low`                                                            |
| `title`              | yes      | Short human-readable title                                                             |
| `description`        | yes      | Detailed description with enough context to execute without a human                    |
| `acceptanceCriteria` | yes      | **At least one** verifiable criterion. A mission without criteria must not be claimed. |
| `files`              | yes      | Files the mission is expected to touch (used for review scope)                         |
| `createdAt`          | yes      | ISO-8601 UTC timestamp                                                                 |
| `claimedAt`          | no       | Set by the claiming agent                                                              |
| `completedAt`        | no       | Set when verification passes                                                           |
| `status`             | yes      | `pending` \| `claimed` \| `running` \| `verifying` \| `completed` \| `failed`          |
| `claimedBy`          | no       | Agent identity that claimed the mission                                                |
| `attempts`           | yes      | Number of failed verification attempts (starts at 0)                                   |
| `maxAttempts`        | yes      | Maximum attempts before the mission is marked failed (default 3)                       |

### 3.3 GitHub Issues as Missions

Missions can also be tracked as GitHub issues. The control plane maps:

| Mission field        | GitHub issue element                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | Issue number (e.g. `mission-#123`)                                                                                                           |
| `title`              | Issue title                                                                                                                                  |
| `description`        | Issue body                                                                                                                                   |
| `acceptanceCriteria` | Issue body checklist (`- [ ]`)                                                                                                               |
| `priority`           | Label `priority:high` / `priority:medium` / `priority:low`                                                                                   |
| `type`               | Label `type:growth` / `type:product` / `type:content` / `type:seo` / `type:ops` / `type:fix`                                                 |
| `status`             | Label `status:pending` / `status:claimed` / `status:running` / `status:verifying` / `status:completed` / `status:reviewed` / `status:failed` |
| `claimedBy`          | Issue assignee                                                                                                                               |
| `attempts`           | Comment counter or `attempts:N` label                                                                                                        |

When using issues, the mission file in `missions/` is still created (or updated) so the control plane state remains file-based and durable.

---

## 4. How Agents Claim and Execute Missions

### 4.1 Claim (NEW_MISSION → CLAIMED)

1. Read `state.json` and confirm `status` is `IDLE` or `NEW_MISSION`.
2. Pick the highest-priority `pending` mission in `missions/` (or the single mission if only one exists).
3. Verify the mission has at least one `acceptanceCriteria` entry. If not, do **not** claim — flag it for a human.
4. Claim by updating the mission file:
   - `status: "claimed"`
   - `claimedAt: <now>`
   - `claimedBy: "<agent-identity>"`
5. Update `state.json`:
   - `status: "CLAIMED"`
   - `currentMission: "<mission-id>"`
6. Commit both files with `Signed-off-by`.

### 4.2 Execute (CLAIMED → RUNNING)

1. Update the mission file `status: "running"` and `state.json` `status: "RUNNING"`; commit.
2. Execute the mission following the repository governance in `AGENTS.md`:
   - Read `docs/roadmap.md` first for growth/product tasks.
   - One production-ready task at a time.
   - Preserve privacy-first/local-first behavior.
   - Use existing product patterns (premium gates, export credits, entitlement checks, Persian RTL UI, toasts, tests).
3. Update `state.json` `lastHealthCheck` on every heartbeat (default every 5 minutes) to keep the lease alive.

### 4.3 Verify (RUNNING → VERIFICATION)

Run the full QA gate:

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
```

All four must pass. If any fails:

- Fix the issue.
- Increment `attempts` in the mission file.
- If `attempts < maxAttempts`: return to RUNNING and retry.
- If `attempts >= maxAttempts`: mark the mission `status: "failed"`, write a report with `status: "failed"`, and archive it.

### 4.4 Report (VERIFICATION → COMPLETED)

1. Write a report file to `reports/<mission-id>.json` using `reports/_template.json`:

```json
{
  "missionId": "mission-20260830-000000",
  "completedAt": "2026-08-30T01:05:00Z",
  "status": "success",
  "changes": [
    {
      "file": "components/home/RoleCard.tsx",
      "action": "modified",
      "linesChanged": 24
    }
  ],
  "verification": {
    "typecheck": true,
    "lint": true,
    "tests": true,
    "build": true
  },
  "duration": "5m30s",
  "notes": "Added onClick handlers with UTM params; verified no hydration errors."
}
```

2. Update the mission file: `status: "completed"`, `completedAt: <now>`.
3. Update `state.json`:
   - `status: "COMPLETED"`
   - `lastCompletedMission: "<mission-id>"`
   - `lastCompletedAt: <now>`
   - `totalMissionsCompleted: +1`
4. Commit all changes with `Signed-off-by`.

### 4.5 Review (COMPLETED → REVIEWED)

1. A human (or designated reviewer) inspects the diff, the report, and the acceptance criteria.
2. The reviewer signs a review artifact with the **Ed25519 review private key** (held only by the review authority, never by the agent/executor) and writes it to `reviews/<mission-id>.json`:

```json
{
  "missionId": "mission-20260830-000000",
  "reviewer": "external-chatgpt-review",
  "reportPath": "docs/growth/agent-loop/reports/mission-20260830-000000.json",
  "reportSha": "451c5f8f470e...",
  "implementationSha": "abc123def456",
  "verdict": "approved",
  "findings": ["Acceptance criteria met; no regressions observed."],
  "reviewedAt": "2026-08-30T14:00:00Z",
  "nonce": "11111111-1111-4111-8111-111111111111",
  "signatureAlgorithm": "ed25519",
  "keyId": "8234512b8e871587",
  "signature": "<ed25519 signature over the canonical payload>"
}
```

- The orchestrator verifies the signature with **only** `REVIEW_PUBLIC_KEY` (or `REVIEW_PUBLIC_KEY_FILE`); it never holds the private key.
- The private key lives under a distinct Unix account (`pt-review`, mode `0600`) or entirely outside the execution plane — the agent user must not be able to read it (`scripts/growth/agent-loop/verify-key-isolation.sh` proves this).
- `commits[]` in the report contains **only real `git rev-list` results**; if enumeration fails, `provenanceStatus: "failed"` is recorded — the `[baseSha, headSha]` fallback was removed in v3.2.

3. On approval, the mission file moves to `archive/<mission-id>.json` **unchanged** (immutable).
4. `state.json` resets to `IDLE` with `currentMission: null`.

---

## 5. Verification Requirements

Verification is **mandatory** before any mission is marked `completed`. The evidence lives in the report file.

### 5.1 Required Gates

| Gate      | Command             | Required |
| --------- | ------------------- | -------- |
| Typecheck | `pnpm typecheck`    | yes      |
| Lint      | `pnpm lint`         | yes      |
| Tests     | `pnpm vitest --run` | yes      |
| Build     | `pnpm build`        | yes      |

### 5.2 Acceptance Criteria

- Every mission must have at least one `acceptanceCriteria` entry.
- The report must state, per criterion, how it was verified (test name, manual check, curl output).
- A mission whose criteria are not all met is **not** complete — it returns to `RUNNING` for retry.

### 5.3 Evidence Rules

- `verification.typecheck/lint/tests/build` must be `true` for `status: "success"`.
- `changes[].action` must be one of `created | modified | deleted`.
- `changes[].linesChanged` must be a non-negative integer.
- The report `missionId` must match the mission file `id`.

### 5.4 Post-Deploy Health Check

If the mission touches production-facing code, the mandatory post-deploy health check from `AGENTS.md` applies (health endpoint, 10 key pages HTTP 200, CSS 200, fonts 200). **Never deploy without explicit user approval.**

---

## 6. Rollback Procedures

### 6.1 Mission Rollback (before archive)

If a mission is `claimed`/`running` and must be abandoned:

1. Update the mission file: `status: "pending"`, `claimedAt: null`, `claimedBy: null`.
2. Update `state.json`: `status: "IDLE"`, `currentMission: null`.
3. Commit. The mission is available for the next agent.

### 6.2 Code Rollback (after completion)

If a completed mission introduced a regression:

1. Revert the code with `git revert <commit-sha>` (or `git checkout <previous-sha> -- <files>` for partial reverts).
2. Re-run the verification suite.
3. Write a follow-up report in `reports/` referencing the original mission id with `status: "reverted"` and the revert commit sha in `notes`.
4. If the mission was already archived, do **not** modify the archived file — the follow-up report is the record.

### 6.3 Production Rollback

For deployed regressions, follow the blue-green rollback in `AGENTS.md`: switch the nginx upstream back to the previous slot (<1s). No code changes needed.

### 6.4 State File Recovery

If `state.json` is corrupted or lost:

1. Rebuild it from the mission files: the highest-priority non-archived mission with `status: "claimed" | "running"` becomes `currentMission`; otherwise `IDLE`.
2. Reset counters only if the original values are unrecoverable, and note the reset in the commit message.

---

## 7. GitHub Integration

GitHub is the durable control plane. The file tree in this directory is the canonical state; GitHub issues/labels mirror it for visibility and human workflow.

### 7.1 Issue ↔ Mission Mapping

| Mission element       | GitHub mechanism                                                |
| --------------------- | --------------------------------------------------------------- |
| Mission file          | Issue body (description + acceptance criteria checklist)        |
| Status                | Label `status:<state>`                                          |
| Priority              | Label `priority:high` / `priority:medium` / `priority:low`      |
| Type                  | Label `type:<type>`                                             |
| Claim                 | Assignee + `status:claimed` label                               |
| Verification evidence | Comment with report JSON or link to `reports/<mission-id>.json` |
| Review                | PR review / issue comment with verdict                          |
| Archive               | Close the issue + move mission file to `archive/`               |

### 7.2 Labels

```
status:pending    status:claimed    status:running
status:verifying  status:completed  status:reviewed  status:failed
priority:high     priority:medium   priority:low
type:growth       type:product      type:content     type:seo
type:ops          type:fix
```

### 7.3 Agent Workflow with GitHub

1. **Poll**: list open issues with `status:pending` (or watch `missions/`).
2. **Claim**: assign the issue to yourself, add `status:claimed`, and update the mission file.
3. **Execute**: work on a branch named `mission/<mission-id>`.
4. **Verify**: run the full QA gate.
5. **Report**: open a PR with the report file; set `status:verifying` → `status:completed` on merge.
6. **Review**: human approves the PR; set `status:reviewed`; close the issue; archive the mission file.

### 7.4 CI Guardrails

- CI runs `pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build` on every PR.
- A PR that fails the gate cannot be merged — this enforces the verification requirement mechanically.
- `pnpm licensing:validate` must not be weakened to bypass governance.

---

## Operational Notes

### Heartbeat

- `state.json.heartbeatIntervalMs` defaults to `300000` (5 minutes).
- Agents update `lastHealthCheck` at least once per interval while `RUNNING`.
- A missed heartbeat expires the lease; the mission returns to `pending`.

### Failure Handling

- Verification failure → retry up to `maxAttempts` (default 3).
- After `maxAttempts`: mission `status: "failed"`, report written with `status: "failed"`, mission archived, `state.json.totalMissionsFailed` incremented.
- Lease timeout → mission returns to `pending` (does not count as a failed attempt).

### Immutability of Archive

- Files in `archive/` are never modified after being moved there.
- Corrections are expressed as new reports/reviews, never edits to archived files.

### Related Documents

- `AGENTS.md` — agent governance, deploy rules, QA gate, post-deploy health checks.
- `docs/roadmap.md` — source of truth for growth work and mission backlog.
- `docs/growth/README.md` — growth system overview.
- `docs/growth/mission-log.md` — execution journal.
- `docs/growth/HUMAN-ACTIONS.md` — human action requirements.
- `docs/technical/agent-execution-guidelines.md` — agent execution guidelines.
- `docs/technical/agent-permissions-constraints.md` — agent permissions and constraints.

---

## Canary Verification (Phase 2.9)

The control plane was verified end-to-end with the `mission-control-plane-canary` mission.

### Evidence

| Item         | Value                                               |
| ------------ | --------------------------------------------------- |
| Mission ID   | `mission-control-plane-canary`                      |
| Canary SHA   | `cc0e530e` (created by real executor)               |
| Executor     | `opencode run --auto`                               |
| Verification | typecheck ✅, lint ✅                               |
| Report       | `reports/mission-control-plane-canary.json` + `.md` |
| State        | COMPLETED — awaiting external REVIEW                |

### What the Canary Proved

1. Mission discovery from filesystem works
2. Claim/lease system works
3. Real executor (`opencode run`) invoked successfully
4. Canary file created at correct path
5. Verification (typecheck + lint) passed
6. Report generated (JSON + Markdown)
7. State transitions persisted to git
8. GitHub contains all evidence

---

## Version History

| Version | Date       | Changes                                   |
| ------- | ---------- | ----------------------------------------- |
| 2.0     | 2026-08-08 | Phase 2.9: real executor, canary verified |
| 1.0     | 2026-08-08 | Initial Agent Control Plane (§29–33)      |
