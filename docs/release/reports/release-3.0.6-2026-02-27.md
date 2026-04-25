# Release 3.0.6 (2026-02-27)

## Scope

- Footer IA/content refactor and legal/developer strip update.
- `/asdev` rebrand and profile-first simplification.
- New `/terms` and `/refer` pages with legal/share UX updates.
- `/how-it-works` enrichment and navigation cleanup.
- Home CTA routing fixes (`/topics`, `/tools/specialized`).
- Address transliteration tool v3:
  - strict/readable output modes
  - map actions (Neshan/Balad)
  - inline error-report payload flow

## Deployments

- Staging release: `20260227T103430Z-address-v3-map`
- Production release: `20260227T104417Z-prod-v3-map`
- Version bump after rollout: `3.0.6`

## Runtime Verification

- `https://staging.persiantoolbox.ir/api/health` => 200
- `https://persiantoolbox.ir/api/health` => 200
- `https://persiantoolbox.ir/api/version` reachable and healthy

## Notes

- SSH access restored and standardized on `~/.ssh/id_ed25519` for deploy operations.
- This release report captures the consolidated closeout state for enterprise deployment.
