# PersianToolbox Handoff - 2026-07-07

## Current Repo State

- Branch: `main`
- Local status: clean working tree
- Sync status: `main` synced with `origin/main`
- Latest local commits:
  - `997404a8 docs: tighten public doc wording`
  - `aa729291 docs: add contributor privacy and showcase asset guides`
  - `2be46c62 chore: finalize public repository polish`
  - `b42e2246 docs: polish public repository showcase`

## Current Production / Staging State

- Production site: `https://persiantoolbox.ir`
- Staging site: `https://staging.persiantoolbox.ir`
- Production deploy approval: still required explicitly before any deploy
- Latest documented production baseline in governance docs:
  - blue-green deploy flow active
  - health checks previously passed
  - CSP enforcement + consent mode + GA4 live

## What Was Completed In This Session

### Public Repository Showcase

- Public README was polished as a stronger portfolio-facing showcase:
  - clearer product positioning
  - architecture and quality sections
  - real screenshot gallery
  - explicit quality gates and security commands
- Public docs structure was improved:
  - `docs/architecture/README.md`
  - `docs/repository-showcase-assets.md`
  - `docs/README.md`
  - `docs/open-source-mvp-spec.md`
- Community workflow polish landed:
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `.github/ISSUE_TEMPLATE/config.yml`
  - `.github/ISSUE_TEMPLATE/bug_report.yml`
  - `.github/ISSUE_TEMPLATE/feature_request.yml`
  - `CONTRIBUTING.md`
- GitHub repository metadata was aligned:
  - repository URL and bugs URL in `package.json`
  - topic `local-first` added on GitHub
  - labels `rtl`, `privacy`, `local-first` added on GitHub

### Community Tracking

- Created public GitHub issues:
  - `#121` screenshot refresh workflow
  - `#122` contributor privacy/local-first checklist
  - `#123` public docs RTL consistency pass
  - `#124` public GitHub Project board
- Closed after implementation:
  - `#121`
  - `#122`
  - `#123`
- Remaining open item:
  - `#124` Create a public GitHub Project board with `Now / Next / Later` columns

## Verification Completed

- `pnpm security:secrets`
- `pnpm security:scan`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm vitest --run`
- `pnpm docs:auto:check`

Result: all passed locally; dependency audit still reports only low/moderate findings, with no high or critical issue.

## Current Blocker

- GitHub Project board creation is blocked by the current GitHub CLI token scopes.
- `gh project list --owner alirezasafaei-dev` fails with missing `read:project`.
- Repo-side work is complete; the remaining action requires a refreshed GitHub auth token with project access.

## Immediate Next Steps

1. Refresh GitHub CLI auth with project scopes.
2. Create the public GitHub Project board for issue `#124`.
3. Link that board from the public roadmap/open-source docs.
4. Continue the next approved product roadmap item from `docs/roadmap.md` and `docs/product/phased-execution-roadmap-codex.md`.

## Useful References

- `docs/roadmap.md`
- `docs/open-source-mvp-spec.md`
- `docs/repository-showcase-assets.md`
- `docs/README.md`
- `README.md`
