# Snapshot: Priority 4 History Async Regression Coverage

Date: 2026-02-07
Branch: main

## What Was Implemented

- Added regression unit tests for `RecentHistoryCard` async states:
  - unauthorized path (no `pt_session` cookie)
  - error path on failed fetch
  - retry flow from error to successful data render
  - empty state when entries are empty
- Kept accessibility semantics under test by asserting `role="alert"` in error state.
- Confirmed the retry action issues a new request and transitions to a ready state.

## Validation (Executed)

1. `pnpm vitest --run tests/unit/recent-history-card.test.tsx` ✅
2. `pnpm ci:quick` ✅

## Key Files Updated

- `tests/unit/recent-history-card.test.tsx`
- `docs/roadmap.md`
- `docs/index.md`
- `CHANGELOG.md`

## Next Start Point

1. Extend `AsyncState` to additional high-traffic tool pages (`loan`, `salary`, `date-tools`).
2. Add E2E checks for account/history retry behavior under network failures.
3. Continue RTL audit in Priority 4 and close remaining logical-direction gaps.
