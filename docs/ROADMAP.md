# PersianToolbox Roadmap Handoff

Canonical roadmap remains `docs/roadmap.md`. This file exists for agents or tooling that look for uppercase `docs/ROADMAP.md`.

## Current Status - 2026-07-02

- Production site: `https://persiantoolbox.ir`
- Latest pushed production commit: `6608314e fix: complete final seo ux accessibility qa pass`
- Deploy command used: `bash deploy-vps-auto.sh`
- Deploy succeeded; PM2 restarted successfully; health check OK.
- Homepage and `/loan` returned HTTP 200.
- `www` redirects to non-www with path/query preserved.
- `/sitemap.xml` and `/robots.txt` returned HTTP 200.
- Canonical smoke checks passed.
- `[object Object]` count in fetched homepage and `/loan` HTML was `0`.

## Next TODO

1. Expose production git commit hash in `/api/version`.
2. Improve CSP and remove `unsafe-inline` with a nonce/hash-based approach.
3. Run production Lighthouse after deploy.
4. Improve `/loan` performance; previous local Lighthouse Performance score was `78`.
5. Reduce lint warnings: `no-non-null-assertion`, `no-nested-ternary`, `react-hooks/exhaustive-deps`, `no-img-element`, `no-console`.
6. Investigate build warnings: stale Browserslist data, custom Cache-Control notice, Turbopack NFT trace warning.
7. Continue deeper UX/a11y/performance audit for remaining tool pages.
8. Add better production release traceability.

## Where To Continue

1. Run `git status --short --branch`.
2. Check `curl -s https://persiantoolbox.ir/api/health`.
3. Read `docs/HANDOFF.md`.
4. Continue with `/api/version` commit hash traceability.
