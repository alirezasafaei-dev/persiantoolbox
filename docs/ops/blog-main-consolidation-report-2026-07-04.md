# Blog Main Consolidation Report - 2026-07-04

## Summary

Prepared product-grade blog fixes on `release/blog-product-grade-ready`. Production deployment is intentionally untouched because `.github/workflows/deploy-production.yml` deploys production on push to `main`.

Fixed real WebP generation, existing mismatched WebP assets, article OG images, blog image auditing, visible taxonomy normalization, editorial card/homepage presentation, recommended-post labeling, and server-first article rendering planning.

## Main State

- main SHA before: `fdc6c6e56f70a7e711dc6506191868cfc6c5b355`
- main SHA after: `fdc6c6e56f70a7e711dc6506191868cfc6c5b355`
- origin/main synced: yes
- working tree clean: yes after report commit/push
- MAIN PUSH TRIGGERS DEPLOY: yes
- MAIN NOT MERGED: yes

## PRs Created

- #115 - `feat(blog): prepare product-grade blog quality fixes` - `release/blog-product-grade-ready`

## PRs Merged

- None. Held because push to `main` triggers production deployment.

## PRs Held or Blocked

- #115 is held for human-controlled merge/deploy sequencing. Reason: `.github/workflows/deploy-production.yml` runs production SSH/PM2 deploy on push to `main`.

## Validation Matrix

| Check                 | Result       | Evidence                                                                         |
| --------------------- | ------------ | -------------------------------------------------------------------------------- | --- | ----------------------------------------------------------------------------- |
| typecheck             | PASS         | `pnpm typecheck` exited 0                                                        |
| lint                  | PASS         | `pnpm lint` exited 0 with existing warnings                                      |
| build                 | PASS         | `pnpm build` exited 0 and generated 833 static pages                             |
| vitest                | PASS         | `pnpm vitest --run`: 148 files, 1238 tests passed                                |
| blog image audit      | PASS         | `pnpm blog:images:audit`: 126 posts, 0 errors, 142 warnings                      |
| screenshot dry-run    | PASS         | `node scripts/capture-blog-screenshots.js --dry-run` listed planned WebP outputs |
| live homepage         | PASS         | `curl -I https://persiantoolbox.ir/` returned 200                                |
| live blog             | PASS         | `curl -I https://persiantoolbox.ir/blog` returned 200                            |
| live robots           | PASS         | `curl -I https://persiantoolbox.ir/robots.txt` returned 200                      |
| live sitemap          | PASS         | `curl -I https://persiantoolbox.ir/sitemap.xml` returned 200                     |
| live health           | PASS         | `curl -s https://persiantoolbox.ir/api/health` returned `status: ok`             |
| live version          | PASS         | `curl -s https://persiantoolbox.ir/api/version` returned version `7.7.0`         |
| object rendering grep | INCONCLUSIVE | `grep -R "\\[object Object\\]" .next                                             |     | true` matched Next/framework/cache internals, not a reliable app UI assertion |

## Blog Fix Status

- WebP screenshot pipeline: fixed with PNG buffer capture and `sharp().webp()` conversion.
- Existing mismatched WebP files: fixed for 16 generated blog inline images.
- Image audit tooling: added `scripts/audit-blog-images.mjs` and `pnpm blog:images:audit`.
- Article OG image: fixed through optional `buildMetadata({ image })` override.
- Taxonomy normalization: fixed for visible labels while preserving existing category routes.
- Card redesign: fixed with editorial aspect ratio, `Image fill`, cleaner tags, and larger list thumbnails.
- Homepage editorial redesign: improved hero, secondary picks, topic hubs, latest grid, and `featured`/`featuredRank` support.
- Popular/recommended label: fixed visible label to `مقاله‌های پیشنهادی`.
- Server-first plan: documented in `docs/architecture/blog-server-first-rendering-plan-2026-07-04.md`.

## Remaining Issues

- Blog image audit reports 142 warnings, mostly missing captions/folder mismatches. No hard errors remain.
- Repo lint still has 290 pre-existing warnings outside this focused work.
- `BlogPost` remains client-heavy by design for this PR; migration is documented for a future branch.
- Main was not updated because production deploy is triggered by push to main.

## Manual Deploy Checklist

Do not run automatically. Human-only sequence after approving merge/deploy timing:

```bash
git checkout main
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm build
# then human-run deploy command only if approved
```

Post-deploy checks:

```bash
curl -s https://persiantoolbox.ir/api/health
curl -s https://persiantoolbox.ir/api/version
curl -I https://persiantoolbox.ir/
curl -I https://persiantoolbox.ir/blog
curl -I https://persiantoolbox.ir/robots.txt
curl -I https://persiantoolbox.ir/sitemap.xml
```

## Rollback Plan

If the merged blog release regresses after a human deployment:

1. Identify the pre-merge main SHA:

```bash
git log --oneline -10
```

2. Revert the merge commit locally and validate:

```bash
git checkout main
git pull --ff-only origin main
git revert <merge-sha>
pnpm typecheck
pnpm lint
pnpm build
pnpm vitest --run
```

3. Push only after human approval:

```bash
git push origin main
```

4. Human redeploys with the approved production deploy path and checks PM2:

```bash
# human only
# bash deploy-vps-auto.sh
# pm2 status
```

No rollback command was executed during this work.
