# Security Policy

## Supported Versions

The latest `main` branch of PersianToolbox receives security updates.
Self-hosted deployments should track `main` and apply updates promptly.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately and responsibly:

- Use GitHub's private vulnerability reporting (recommended): open
  **Security → Report a vulnerability** on the repository.
- Or email the maintainer directly (request the address via a public
  issue marked "security contact request" — do not include exploit
  details in the public issue).

We aim to acknowledge reports within **72 hours** and provide a
remediation timeline within **7 days** for confirmed issues.

## Scope

This policy covers:

- The PersianToolbox source code in this repository.
- The deployed service at `persiantoolbox.ir` (when the issue stems from
  code in this repository).

Out of scope: third-party dependencies (report those upstream), and
issues arising from self-hosted misconfiguration.

## Privacy & Local-First Design

PersianToolbox is built **privacy-first**: most tools run entirely in the
browser and never send user input to a server. Sensitive handling rules:

- No user document content (resumes, invoices, contracts, text) is
  transmitted to our servers by client-side tools.
- Secrets (database credentials, payment keys, API tokens) live only in
  server environment variables and are **never** committed to this repo.
- See `docs/security-secrets-policy.md` for the full secrets-handling
  policy enforced by CI.

## Secret Scanning

Every commit and pull request is checked by `scripts/security/scan-secrets.mjs`
via pre-commit and CI. If you accidentally commit a secret, rotate it
immediately and force-remove it from history before reporting.
