# Enterprise Audit & Compliance Review — asdev-persiantoolbox

- **Assessment mode:** Evidence-First (Ultra-Strict)
- **Date (UTC):** 2026-02-18
- **Repository:** `asdev-persiantoolbox`
- **Website surface assessed:** `http://persiantoolbox.ir/` (+ attempted `https://persiantoolbox.ir/`)
- **Assessed branch (local):** `work` (semantic-release dry-run confirms non-release branch)
- **Baseline commit:** `fd12cbe` (2026-02-16)

---

## 0) In-Scope / Out-of-Scope / Assumptions

### In-Scope

1. Source repository static analysis (code + docs + ops + governance artifacts).
2. Local quality/security gate execution where possible (`pnpm` scripts).
3. External website header-level probing via HTTP/HTTPS.

### Out-of-Scope

1. Cloud account/IAM console settings (no direct tenant access).
2. Live database and backup runtime verification.
3. CDN/WAF provider internals.
4. Third-party SaaS internals (GitHub, npm registry, etc.).

### Third-Party / Vendor Risk Register (observed)

- **GitHub** (code hosting, release integration in semantic-release) — medium risk (supply chain / credential governance).
- **npm ecosystem** (dependency supply chain) — high inherent risk, mitigated partially by lockfile + audit workflows.
- **Playwright/Lighthouse tooling dependencies** — medium operational risk for CI reliability.

---

## 1) Evidence Index

| Evidence ID | Type           | Location                                                                                                                              | What it proves                                                                     | Commit/Date          |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------- |
| E-001       | Repo file      | `package.json`                                                                                                                        | Stack, scripts, Node engine, package manager, release/security scripts             | fd12cbe / 2026-02-16 |
| E-002       | Repo file      | `next.config.ts`                                                                                                                      | Next.js config, strict mode, redirects/rewrites, webpack constraints               | fd12cbe / 2026-02-16 |
| E-003       | Repo file      | `proxy.ts`                                                                                                                            | App security headers + CSP middleware policy                                       | fd12cbe / 2026-02-16 |
| E-004       | Repo file      | `env.production.example`, `env.staging.example`, `.env.example`                                                                       | Environment model, secrets placeholders, feature flags                             | fd12cbe / 2026-02-16 |
| E-005       | Repo file      | `ops/nginx/persian-tools.conf`                                                                                                        | Reverse proxy topology (prod/staging upstreams)                                    | fd12cbe / 2026-02-16 |
| E-006       | Repo file      | `ops/systemd/*.service`                                                                                                               | Runtime process model (PM2/systemd)                                                | fd12cbe / 2026-02-16 |
| E-007       | Repo file      | `release.config.cjs`, `lighthouserc.json`, `playwright.config.ts`                                                                     | Release, perf, and e2e control gates definitions                                   | fd12cbe / 2026-02-16 |
| E-008       | Repo files     | `DCO.md`, `docs/licensing/*`, `LICENSE*`, `COMMERCIAL.md`, `TRADEMARKS.md`, `CODEOWNERS`, `NOTICE`                                    | Governance and licensing boundaries (`<=v1.1.x` vs `>=v2.0.0`)                     | fd12cbe / 2026-02-16 |
| E-009       | Command output | `artifacts/pnpm-install.log`                                                                                                          | Dependency install reproducibility (lockfile up-to-date)                           | 2026-02-18           |
| E-010       | Command output | `artifacts/pnpm-lint.log`                                                                                                             | Lint gate pass                                                                     | 2026-02-18           |
| E-011       | Command output | `artifacts/pnpm-typecheck.log`                                                                                                        | Typecheck gate pass                                                                | 2026-02-18           |
| E-012       | Command output | `artifacts/pnpm-test.log`                                                                                                             | Unit/integration tests pass (`249 passed`)                                         | 2026-02-18           |
| E-013       | Command output | `artifacts/pnpm-test-e2e.log`                                                                                                         | E2E executed after prerequisites install: 77 passed, 5 failed, 12 skipped          | 2026-02-18           |
| E-014       | Command output | `artifacts/pnpm-ci-contracts.log`                                                                                                     | Contract validation gates pass (release/deploy/licensing/PWA/monetization)         | 2026-02-18           |
| E-015       | Command output | `artifacts/pnpm-audit-prod.log`, `artifacts/pnpm-audit-dev.log`                                                                       | Prod deps no high vulns; dev deps include low/moderate vulns                       | 2026-02-18           |
| E-016       | Command output | `artifacts/osv-scanner.log`, `artifacts/gitleaks.log`, `artifacts/syft.log`, `artifacts/sbom-cyclonedx.json`                          | Security toolchain operational: OSV findings, gitleaks findings, SBOM generated    | 2026-02-18           |
| E-017       | Command output | `artifacts/pnpm-lighthouse-ci.log`                                                                                                    | Lighthouse CI executed with Chrome path override; perf threshold warnings reported | 2026-02-18           |
| E-018       | Command output | `artifacts/http-headers-http.txt`, `artifacts/http-headers-https.txt`, `artifacts/homepage.headers.txt`, `artifacts/homepage.err.txt` | Web surface: HTTP 301 to HTTPS, HTTPS header responses intermittent/timeouts       | 2026-02-18           |
| E-019       | Command output | `artifacts/robots.*`, `artifacts/sitemap.*`                                                                                           | robots/sitemap retrieval failed from current audit environment                     | 2026-02-18           |
| E-020       | Command output | `artifacts/pnpm-semantic-release-dry-run.log`                                                                                         | semantic-release configured for `main`; local branch not publish-eligible          | 2026-02-18           |
| E-021       | Repo file      | `docs/technical/README.md`                                                                                                            | Product goals: Local-First, UX, SEO, performance, correctness                      | fd12cbe / 2026-02-16 |
| E-022       | Command output | `artifacts/repo-recon.txt`                                                                                                            | Module boundaries and route/test inventory snapshot                                | 2026-02-18           |

---

## 1.1) Project Snapshot (Auto-Extract)

| Field               | Value                                                                                                      | Evidence            |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------- |
| Project Name        | `asdev-persiantoolbox`                                                                                     | E-001               |
| Project Type        | Next.js web app + toolbox utilities + docs/governance-heavy repository                                     | E-001, E-021, E-022 |
| Tech Stack          | Next.js 16, React 18, TypeScript, Vitest, Playwright, Storybook, Lighthouse CI, semantic-release, Tailwind | E-001, E-007        |
| Runtime             | Node `>=20`, pnpm `9.15.0`                                                                                 | E-001               |
| Environments        | local + staging + production env templates                                                                 | E-004, E-005, E-006 |
| Deployment & Proxy  | Nginx reverse-proxy to ports 3000/3001 + PM2 via systemd                                                   | E-005, E-006        |
| Business Goals      | Local-First, UX/UI, SEO, Performance, correctness                                                          | E-021               |
| Current Stage       | **Production-intent with active release governance** (conditional due unresolved runtime unknowns)         | E-005, E-006, E-014 |
| Data Classification | Likely Internal + Confidential operational telemetry/session/auth data (**NOT VERIFIED formal policy**)    | E-004, E-021        |
| Compliance Targets  | **Unknown/NOT VERIFIED explicitly declared SOC2/ISO/GDPR target docs**                                     | E-021               |
| RTO / RPO           | **Missing (no formal numeric objective found)**                                                            | E-022               |

---

## 2) Architecture & Trust Boundaries

### 2.1 Repo Recon and Module Boundaries

- UI/routes live under `app/` with multiple tool routes and API routes.
- Business logic in `features/` and shared/common modules in `shared/`, `lib/`, `components/`.
- CI/testing boundaries across `tests/unit` and `tests/e2e`.
- Operational/release governance is strongly represented in `ops/`, `scripts/`, `docs/release`, `docs/licensing`.

### 2.2 Data Flow (simplified)

```text
[Browser/User]
    |
    v
[Next.js app routes + middleware(proxy.ts)]
    |            \
    |             -> [Static assets/PWA cache]
    v
[app/api/* routes]
    |----> [analyticsStore / app data dir]
    |----> [DB via DATABASE_URL]
    |----> [admin auth checks]
    v
[Operational env + process manager (PM2/systemd)]
    |
    v
[Nginx reverse proxy :80 (prod/staging upstream)]
```

### 2.3 Trust Boundaries

1. Internet user input crossing into `app/api/*` handlers.
2. Middleware-enforced headers/CSP boundary (`proxy.ts`).
3. Secret boundary from env vars (`DATABASE_URL`, webhook/analytics secrets).
4. Admin-only analytics summary access boundary (`requireAdminFromRequest`).

### 2.4 Runtime Topology (Build→Artifact→Runtime)

- Build: `pnpm build` (includes OG image generation).
- Test/Gates: lint/typecheck/unit/e2e/contract validations.
- Release: semantic-release on `main` only.
- Runtime: Next.js served behind Nginx + PM2/systemd.

---

## 2.5 Build / Quality Gates Results

| Gate                     | Result               | Notes                                                         | Evidence |
| ------------------------ | -------------------- | ------------------------------------------------------------- | -------- |
| `pnpm install`           | PASS                 | Lockfile up-to-date                                           | E-009    |
| `pnpm lint`              | PASS                 | No lint errors                                                | E-010    |
| `pnpm typecheck`         | PASS                 | No TS errors                                                  | E-011    |
| `pnpm test -- --run`     | PASS                 | 70 files, 249 tests passed                                    | E-012    |
| `pnpm test:e2e`          | FAIL                 | Executed successfully but 5 real test failures remain         | E-013    |
| `pnpm ci:contracts`      | PASS                 | Deploy/release/licensing/PWA/monetization contracts validated | E-014    |
| `pnpm audit --prod`      | PASS                 | No known vulnerabilities                                      | E-015    |
| `pnpm audit --dev`       | WARN                 | 6 vulnerabilities (2 low, 4 moderate)                         | E-015    |
| `osv-scanner`            | FAIL                 | Detected 7 vulnerabilities (incl. 1 high)                     | E-016    |
| `gitleaks`               | FAIL                 | Detected 6 potential secret leaks                             | E-016    |
| `syft SBOM`              | PASS                 | Generated CycloneDX SBOM (`artifacts/sbom-cyclonedx.json`)    | E-016    |
| `pnpm lighthouse:ci`     | WARN                 | Runs with explicit chrome flags; perf thresholds not met      | E-017    |
| `pnpm release --dry-run` | PASS (informational) | Publishing blocked outside `main`                             | E-020    |

---

## 2.6 Web Surface Audit (`persiantoolbox.ir`)

| Check                          | Result                                                         | Evidence |
| ------------------------------ | -------------------------------------------------------------- | -------- |
| HTTP reachability              | PASS (`301` to HTTPS)                                          | E-018    |
| HTTPS reachability             | PARTIAL/INTERMITTENT (headers seen, timeouts observed)         | E-018    |
| TLS/HSTS verification          | NOT VERIFIED conclusively (transport instability in audit env) | E-018    |
| Security headers at edge       | NOT VERIFIED conclusively (partial header capture only)        | E-018    |
| robots/sitemap fetch           | FAILED from current environment                                | E-019    |
| Lighthouse public-site run     | PARTIAL (local LHCI against local build executed)              | E-017    |
| External script/link integrity | NOT VERIFIED (homepage body retrieval timed out)               | E-018    |

---

## 3) Compliance Mapping

### 3.1 OWASP ASVS Mapping (minimum required)

| ASVS Area                       | Status         | Evidence                                                                   | Gap Summary                                                    |
| ------------------------------- | -------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| V1 Architecture/Threat Modeling | PARTIAL        | E-021, E-022                                                               | No formal threat model artifact in repo root compliance pack   |
| V2 Authentication               | PARTIAL        | API auth endpoints mostly disabled (`410`), admin guard in analytics route | Auth model appears transitional; formal IAM design doc missing |
| V3 Session Management           | PARTIAL        | env/session TTL present                                                    | Session hardening controls not fully evidenced end-to-end      |
| V4 Access Control               | PARTIAL        | `requireAdminFromRequest` usage in analytics GET                           | System-wide access control matrix missing                      |
| V5 Validation/Sanitization      | PARTIAL        | Analytics payload validation + max event limits                            | Centralized validation standard not formally documented        |
| V7 Error Handling/Logging       | PARTIAL        | Structured JSON error responses observed                                   | Centralized logging + retention/SIEM linkage unclear           |
| V9 Data Protection              | PARTIAL        | CSP/security headers middleware + HTTPS redirect                           | At-rest encryption & data retention policies incomplete        |
| V14 Config/Deployment           | STRONG PARTIAL | ops + release + deploy contract checks                                     | Lacking formal IaC policy + immutable infra evidence           |

### 3.2 NIST SSDF Mapping

| SSDF Function                      | Status         | Evidence                                        | Gaps                                                                 |
| ---------------------------------- | -------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| PO (Prepare Organization)          | PARTIAL-STRONG | Governance docs (DCO/CLA/CODEOWNERS/licensing)  | No explicit secure coding training policy evidence                   |
| PS (Protect Software)              | PARTIAL        | CSP, headers, secrets via env templates         | Missing secret rotation policy + secret scanning automation evidence |
| PW (Produce Well-Secured Software) | STRONG PARTIAL | Lint/typecheck/tests/contracts/release controls | E2E/perf gates blocked in current environment                        |
| RV (Respond to Vulnerabilities)    | PARTIAL        | `pnpm audit` workflow exists                    | No demonstrated incident vuln SLA or triage runbook linkage          |

### 3.3 Governance & Legal (Project-Specific)

| Control/Policy                                          | Evidence                   | Gap                                                                               | Remediation                                             | Owner               |
| ------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------- |
| Dual-license boundary (`<=v1.1.x` MIT, `>=v2.0.0` dual) | LICENSE + dual policy docs | Boundary text typo (`> =`) in one doc; formal legal sign-off artifact not bundled | Normalize language + attach legal approval memo         | Legal + Maintainer  |
| DCO + CLA governance                                    | `DCO.md`, CLA docs         | No automation evidence that CLA/DCO is enforced at PR gate                        | Add CI check for Signed-off-by + CLA bot status         | DevOps + Maintainer |
| Ownership controls                                      | `CODEOWNERS`               | Branch protection evidence not available in repo                                  | Export branch protection policy snapshot to docs        | Repo Admin          |
| Trademark/Notice                                        | `TRADEMARKS.md`, `NOTICE`  | Attribution obligations for dependencies not clearly centralized                  | Produce attribution inventory/NOTICE generation process | Legal/Compliance    |

---

## 4) Role-Based Review (Enterprise Strict)

> Likelihood/Impact scale: 1..5; Risk = L×I.

### 4.1 Production-Grade Web Systems Engineer

1. **Current State:** Strong local QA automation (lint/typecheck/unit/contracts) and Next.js operational deployment model.
2. **Control Gaps:** E2E and Lighthouse gates non-operational in this environment (ASVS V14, SSDF PW).
3. **Risks:** Broken user journeys/perf regressions escaping CI (L3×I4=12).
4. **Findings:** High: E2E/perf gates are executable, but currently failing on real quality defects (E-013/E-017).
5. **Recommendations:** P0 install deterministic browser runtime in CI; P1 enforce gate failure thresholds.
6. **Acceptance:** Successful `pnpm test:e2e:ci`, LHCI report archived each release.
7. **Owner/Effort:** QE+DevOps, 2-4 days.

### 4.2 Software Architect

1. Current: Clear modular boundaries and Local-First design intent.
2. Gaps: Formal threat model + ADR index incomplete.
3. Risks: Architectural drift and inconsistent trust-boundary enforcement (L3×I4=12).
4. Findings: Medium.
5. Recs: P1 STRIDE doc + ADR mapping.
6. Acceptance: Versioned architecture decision register and threat model artifact.
7. Owner: Architecture lead, 3-5 days.

### 4.3 Senior Back-End Engineer

1. Current: API routes validate inputs in key handlers; some sensitive surfaces intentionally disabled with 410.
2. Gaps: Central API authN/authZ matrix missing.
3. Risks: Future re-enable of endpoints without consistent controls (L3×I5=15).
4. Findings: High.
5. Recs: P0 API security baseline checklist for every route.
6. Acceptance: route-by-route control table + tests for authz failure modes.
7. Owner: Backend lead, 4-6 days.

### 4.4 Senior Front-End Engineer

1. Current: Next.js + route structure + PWA/lighthouse configs present.
2. Gaps: Live A11y/perf evidence unavailable this run.
3. Risks: UX/accessibility regressions (L3×I3=9).
4. Findings: Medium.
5. Recs: P0 fix failing accessibility/offline scenarios and enforce regression budget in CI.
6. Acceptance: Automated reports attached per PR/release.
7. Owner: Frontend lead, 2-4 days.

### 4.5 SRE

1. Current: PM2+systemd+nginx, rollback script and checklist contracts exist.
2. Gaps: Formal SLI/SLO + alert policy evidence not centrally codified.
3. Risks: Slow incident detection/recovery (L3×I5=15).
4. Findings: High.
5. Recs: P0 define SLO + paging/runbook policy.
6. Acceptance: SLO dashboard links + oncall runbook + drill evidence.
7. Owner: SRE, 1-2 weeks.

### 4.6 DevOps / Cloud Engineer

1. Current: Strong script-based release/deploy governance.
2. Gaps: Tooling is available, but findings triage/closure workflow and policy SLAs are not yet evidenced.
3. Risks: Supply-chain blind spots (L4×I4=16).
4. Findings: Critical.
5. Recs: P0 add gitleaks/osv/syft/trivy in CI container.
6. Acceptance: Green security pipeline with archived artifacts.
7. Owner: DevOps, 1 week.

### 4.7 Security Engineer

1. Current: Middleware security headers/CSP and analytics secret enforcement logic exist.
2. Gaps: No end-to-end evidence for secret rotation, KMS, incident SLAs.
3. Risks: Secret compromise impact escalation (L3×I5=15).
4. Findings: High.
5. Recs: P0 secrets lifecycle policy + periodic rotation and audit logging.
6. Acceptance: documented policy + proof-of-rotation report.
7. Owner: Security, 1 week.

### 4.8 Data Engineer

1. Current: app/analytics data dirs and DB URLs modeled via env templates.
2. Gaps: Formal data inventory/classification and retention schedule incomplete.
3. Risks: Privacy non-conformance (L3×I4=12).
4. Findings: High.
5. Recs: P1 data catalog + retention/deletion controls.
6. Acceptance: approved data map + retention policy + deletion test evidence.
7. Owner: Data/Platform, 1 week.

### 4.9 Product Manager

1. Current: Product goals and phased plans documented.
2. Gaps: Compliance acceptance criteria per release not centrally KPI-bound.
3. Risks: release with unknown compliance debt (L3×I4=12).
4. Findings: Medium.
5. Recs: P1 release go/no-go checklist including compliance gates.
6. Acceptance: Signed release checklist with security/compliance signoff.
7. Owner: PM, 2-3 days.

### 4.10 QA Automation Engineer

1. Current: robust test suite (249 unit/integration tests).
2. Gaps: E2E instability due browser runtime dependency management.
3. Risks: Critical flows unverified pre-release (L4×I4=16).
4. Findings: Critical.
5. Recs: P0 preinstall browsers in CI image + deterministic playwright cache.
6. Acceptance: E2E pass rate trend + flaky budget tracked.
7. Owner: QA, 3-5 days.

---

## 5) Security Deep-Dive

### 5.1 STRIDE (Minimum Viable)

- **Assets:** user sessions, analytics events, admin settings endpoint, deployment artifacts, license/release metadata.
- **Actors:** anonymous users, admins, maintainers, CI runners.
- **Entry points:** public routes, `app/api/*`, deployment scripts, release automation.
- **Top threats (10):**
  1. Spoofed analytics ingestion (mitigated via secret header policy) — E-003.
  2. Disabled auth routes unexpectedly re-enabled without controls — E-022.
  3. Supply-chain compromise via dependencies — E-015/E-016.
  4. Secrets scanning now runs but reports leaks requiring triage/remediation — E-016.
  5. CSP bypass via unsafe allowances in non-prod contexts — E-003.
  6. Weak incident observability (unknown SIEM integration) — NOT VERIFIED.
  7. Incomplete TLS/header verification due edge/runtime variability — E-018.
  8. Inadequate DR target objectives (RTO/RPO missing) — E-022.
  9. E2E exposes unresolved a11y/offline regressions — E-013.
  10. Governance drift if dual-license checks are not continuously enforced — E-014/E-008.

### 5.2 IAM & Secrets

- AuthN/AuthZ appears partially disabled for legacy endpoints (410 responses), with admin checks present in analytics summary path.
- Secrets are env-driven, but **rotation cadence and secret manager integration NOT VERIFIED**.

### 5.3 Data Protection & Privacy

- In-transit intent exists (HTTP→HTTPS redirect).
- At-rest encryption, retention/deletion governance, and GDPR-ready records processing: **NOT VERIFIED / PARTIAL**.

### 5.4 Supply Chain Security

- `pnpm audit` exists and runs; dev vulnerabilities remain moderate/low.
- OSV + gitleaks + SBOM are now evidenced; container scanning/provenance attestations remain partial (Trivy/SLSA not evidenced).

### 5.5 Observability & Incident Response

- Health endpoint exists.
- SLI/SLO/error budgets/postmortem templates: **NOT VERIFIED in mandatory audit pack**.

### 5.6 Change Management & Release Governance

- semantic-release + deploy/readiness/release checklists strongly represented.
- Branch promotion policy evidence in GitHub settings not exported here.

---

## 6) Quality Engineering (Audit Level)

| Area                        | Status                                                                       | Evidence            |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------- |
| Test pyramid                | Strong unit/integration; E2E configured                                      | E-012, E-013, E-007 |
| Flaky management            | Retry support and helper patterns present                                    | E-022               |
| Test data strategy          | Contract tests + golden tests present                                        | E-012               |
| Coverage policy             | `test:ci --coverage` exists, but coverage artifact not generated in this run | E-001               |
| Accessibility automation    | e2e a11y specs execute; `/salary` and `/offline` failures remain             | E-013               |
| Performance budgets         | LHCI runs; multiple routes miss min performance threshold (warning-level)    | E-007, E-017        |
| Storybook visual regression | Storybook scripts exist, visual regression gate NOT VERIFIED                 | E-001               |

**Quality Evidence Pack:** `artifacts/pnpm-*.log`, `artifacts/repo-recon.txt`.

---

## 7) Production Readiness Scoring (/100)

> Rule applied: incomplete evidence caps item at 5/10.

1. Architecture & Maintainability: **8/10**
2. Security posture (app+infra+supply chain): **5/10**
3. Compliance & governance (licensing/DCO/CLA): **8/10**
4. Testing maturity: **7/10**
5. Observability & operability: **5/10**
6. Deployment & rollback readiness: **7/10**
7. Performance & scalability: **5/10**
8. Data management & DR (RTO/RPO): **4/10**
9. Documentation & runbooks: **7/10**
10. Evidence completeness (auditability): **6/10**

**Total Score: 64/100**

---

## 8) Stage-Gated Roadmap (Audit-Driven)

### Phase 1 — Stabilization

- **Deliverables:** deterministic CI env (browsers + Chrome), successful E2E/LHCI runs.
- **Gates:** `pnpm test:e2e:ci` pass; LHCI report generated.
- **Evidence:** E2E JSON/JUnit + Lighthouse reports.
- **Effort:** 1 week.
- **Risk reduction:** High.

### Phase 2 — Hardening

- **Deliverables:** gitleaks/osv/syft/trivy integrated.
- **Gates:** security pipeline mandatory on PR.
- **Evidence:** scan reports in CI artifacts.
- **Effort:** 1 week.
- **Risk reduction:** Very high.

### Phase 3 — Security & Reliability

- **Deliverables:** formal IAM matrix, secrets rotation SOP, SLO+oncall runbooks.
- **Gates:** reviewed by Security + SRE.
- **Evidence:** signed docs + drill reports.
- **Effort:** 2 weeks.
- **Risk reduction:** Very high.

### Phase 4 — Compliance Excellence

- **Deliverables:** control library mapping ASVS+SSDF+SOC2/ISO crosswalk.
- **Gates:** quarterly compliance review.
- **Evidence:** versioned compliance pack.
- **Effort:** 2 weeks.
- **Risk reduction:** High.

### Phase 5 — Scalability & Performance

- **Deliverables:** performance baselines, budgets, regression alarms.
- **Gates:** no release with perf budget breach.
- **Evidence:** trend dashboards + reports.
- **Effort:** 1-2 weeks.
- **Risk reduction:** Medium-high.

### Phase 6 — Operability & Observability Excellence

- **Deliverables:** full tracing/logging standards, incident/postmortem workflow.
- **Gates:** game-days and rollback drills passing.
- **Evidence:** incident drill artifacts.
- **Effort:** ongoing.
- **Risk reduction:** High.

---

## 9) Findings Register

| Finding ID | Title                                                        | Severity | Control/Policy Mapping | Evidence    | Risk (L×I) | Fix                                                             | Owner           | ETA       |
| ---------- | ------------------------------------------------------------ | -------- | ---------------------- | ----------- | ---------- | --------------------------------------------------------------- | --------------- | --------- |
| F-001      | E2E quality regressions in accessibility/offline scenarios   | Critical | SSDF-PW, ASVS V5/V14   | E-013       | 4×4=16     | Fix failing e2e scenarios and enforce zero-regression policy    | QA/FE           | 3-5 days  |
| F-002      | Lighthouse performance budgets not met on audited routes     | High     | SSDF-PW, ASVS V14      | E-017       | 3×4=12     | Performance remediation plan + threshold compliance             | FE/Perf         | 1-2 weeks |
| F-003      | Security scans report actionable vulns and potential secrets | Critical | SSDF-PS/RV             | E-016       | 4×4=16     | Triage OSV+gitleaks findings, patch/rotate, document exceptions | Security/DevOps | 1 week    |
| F-004      | RTO/RPO formally missing in audited docs                     | High     | ISO27001 A.17 / DR     | E-022       | 3×5=15     | Define and approve DR objectives                                | SRE/PM          | 1 week    |
| F-005      | Dev dependency vulnerabilities unresolved                    | Medium   | SSDF-RV                | E-015       | 3×3=9      | Patch or risk-accept with expiry                                | Maintainer      | 1 week    |
| F-006      | Incomplete public web-surface verification (timeouts)        | Medium   | ASVS V1/V14            | E-018/E-019 | 2×3=6      | Re-run from stable network vantage + synthetic probe            | SRE             | 2 days    |
| F-007      | No explicit secret rotation policy evidence                  | High     | SSDF-PS                | E-004       | 3×5=15     | Document and execute rotation cadence                           | Security        | 1 week    |
| F-008      | Branch protection evidence not bundled                       | Medium   | SOC2 CC8 (change mgmt) | E-008       | 3×3=9      | Export GH branch protection config artifact                     | Repo Admin      | 2 days    |

### Top 5 Critical Findings

1. F-001 (E2E regressions in accessibility/offline flows)
2. F-003 (actionable vulns + potential secrets findings)
3. F-004 (missing DR objectives)
4. F-007 (secret rotation policy gap)
5. F-002 (performance budgets below thresholds)

### Stop-Ship Criteria

Release MUST be blocked if any is true:

1. Critical vulns or exploitable secrets exposure unresolved.
2. Mandatory CI gates fail: lint/typecheck/unit/contracts/e2e/perf (unless formally waived with compensating controls).
3. DR readiness lacks approved RTO/RPO and rollback evidence for target environment.
4. Licensing/governance validation fails (`licensing:validate`, DCO/CLA obligations).
5. Security scan artifacts (SCA/secrets/SBOM) show unresolved High/Critical risks without approved exception.

### Exceptions & Compensating Controls

- Temporary exception possible for E2E/LHCI only if:
  - manual smoke + peer sign-off is documented,
  - expiry date <= 14 days,
  - CI remediation task is P0 and tracked.

---

## 10) Executive Summary (Board-Ready)

- **Readiness Score:** **64/100**.
- **Compliance Status:** **Conditional Pass** (tooling prerequisites resolved; residual risk now comes from real failing tests and security findings).
- **Biggest Risks:**
  1. Non-operational E2E/perf gates.
  2. Unresolved findings from OSV and gitleaks scans.
  3. No formalized/verified RTO/RPO.
- **Mitigation Timeline:** 2-4 weeks to elevate to audit-defensible pass.
- **Missing Inputs (max 3):**
  1. GitHub branch protection and required status-check export.
  2. Cloud infra/IAM and secrets-manager policy documents.
  3. DR policy with approved numeric RTO/RPO and last drill evidence.

---

## 11) Appendix — Commands & Artifact Checklist

### 11.1 Command Log

| Step | Command                                     | Output summary                            | Evidence ID |
| ---- | ------------------------------------------- | ----------------------------------------- | ----------- |
| 1    | `pnpm install`                              | dependencies already up to date           | E-009       |
| 2    | `pnpm lint`                                 | pass                                      | E-010       |
| 3    | `pnpm typecheck`                            | pass                                      | E-011       |
| 4    | `pnpm test -- --run`                        | 249 tests pass                            | E-012       |
| 5    | `pnpm test:e2e`                             | executed; 77 passed, 5 failed, 12 skipped | E-013       |
| 6    | `pnpm ci:contracts`                         | pass all contract checks                  | E-014       |
| 7    | `pnpm audit --prod --audit-level=high`      | no known vulnerabilities                  | E-015       |
| 8    | `pnpm audit --dev --audit-level=high`       | 6 vulns (low/moderate)                    | E-015       |
| 9    | `osv-scanner --lockfile=pnpm-lock.yaml .`   | 7 vulnerabilities detected                | E-016       |
| 10   | `gitleaks detect --source . --no-git ...`   | 6 potential leaks detected                | E-016       |
| 11   | `syft packages dir:. -o cyclonedx-json=...` | SBOM generated                            | E-016       |
| 12   | `pnpm lighthouse:ci`                        | executed; perf assertion warnings         | E-017       |
| 13   | `curl -I http://persiantoolbox.ir/`         | HTTP 301 to HTTPS                         | E-018       |
| 14   | `curl -I https://persiantoolbox.ir/`        | intermittent timeout + header response    | E-018       |
| 15   | `curl ... robots/sitemap`                   | timeout in this environment               | E-019       |
| 16   | `pnpm release --dry-run`                    | release branch mismatch info              | E-020       |

### 11.2 Required Artifacts

- [x] SBOM (CycloneDX/SPDX) — `artifacts/sbom-cyclonedx.json` (E-016)
- [x] SCA report (pnpm audit) — E-015
- [x] Secrets scan report — `artifacts/gitleaks.log` + JSON report (E-016)
- [ ] Container scan report (Trivy) — **NOT VERIFIED (no image build in this run)**
- [x] Lighthouse CI report — executed with warnings (E-017)
- [x] E2E report (Playwright) — executed with 5 failures remaining (E-013)
- [x] Architecture/trust boundaries diagram — this report section 2
- [ ] Runbooks + incident checklist — partial references only, **not complete compliance pack**
- [ ] DR plan (RTO/RPO) — **Missing**
