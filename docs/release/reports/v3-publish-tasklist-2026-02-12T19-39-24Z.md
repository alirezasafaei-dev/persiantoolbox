# V3 Publish Tasklist (Remote)

- Created at: 2026-02-12T19:39:24Z
- Status: ready-to-execute when publish window is approved

## Minimal Safe Sequence

1. Push branch freeze ref:
   - git push origin release/v3-prep-auto
2. Push local RC tag:
   - git push origin v3.0.0-rc.0-local
3. Open PR from release/v3-prep-auto to main with evidence links:
   - docs/release/v3-readiness-dashboard.md
   - docs/release/reports/go-no-go-2026-02-12T19-38-18Z.md
4. After approval, create final release tag in remote.

## Risk Control

- Keep traffic low: one push burst, one PR creation, one release tag push.
- Avoid repeated workflow retriggers while DNS/deploy windows are unstable.
