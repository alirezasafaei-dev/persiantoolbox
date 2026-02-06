# Security Policy

> Last updated: 2026-02-06

## Supported Versions

- Supported: latest `main` branch.
- Best-effort support: most recent tagged release.

## Reporting a Vulnerability

Report vulnerabilities privately to: `security@persian-tools.ir`

Please include:

- A clear description of the issue.
- Steps to reproduce.
- Impact scope and affected paths.
- Optional PoC (minimal and safe).

## Response Targets

- Initial acknowledgement: within 72 hours.
- Triage status update: within 7 days.
- Fix plan communication: as soon as severity is confirmed.

## Disclosure Policy

- Do not open public issues for security vulnerabilities.
- We follow coordinated disclosure and publish fixes before details.

## Security Baseline (Project-specific)

- CSP + nonce for JSON-LD (`proxy.ts`, `next/script`).
- No runtime third-party scripts for core features.
- Consent required before ads/analytics behaviors.
- Sensitive env vars must be injected via secure environment, not committed.

## Safe Harbor

We will not pursue legal action against good-faith security research that:

- Avoids privacy violations and service disruption.
- Avoids data destruction or privilege escalation beyond proof.
- Provides responsible private disclosure.
