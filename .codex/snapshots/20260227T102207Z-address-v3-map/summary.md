# Summary

- Implemented address transliteration v3:
  - output modes (`strict-postal`, `readable`)
  - map actions (Neshan/Balad)
  - in-tool error feedback payload + support mail flow
- Fixed duplicate highway regex override issue.
- Verified:
  - `pnpm -s vitest --run features/text-tools/address-fa-to-en.test.ts` (pass)
  - `pnpm -s typecheck` (pass)
- Updated execution docs:
  - `TASKS_NEXT.md`
  - `docs/ROADMAP_REAL.md`
- Staging deploy is blocked currently due to SSH connectivity error (`Connection refused` on `185.3.124.93:22`).
