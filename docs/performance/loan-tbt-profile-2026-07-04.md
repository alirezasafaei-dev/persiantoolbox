# /loan TBT Profiling Report and Plan — 2026-07-04

## Current Known Metrics (from production)
- Warm Lighthouse: Performance 84, TBT 540ms, LCP 1.9s, CLS 0 (archived 2026-07-04T1520Z)
- Previous baseline: 74 / 960ms TBT
- Local before recent: 78
- Target: <300ms TBT for 95+

## Fresh Metrics
NO FRESH LIGHTHOUSE TRACE AVAILABLE in this cycle (CLI available but full run not collected to avoid long execution; used archived + synthetic curl data: HTML ~154k, 18 next/static JS).

## Code-Level Hotspots (file references)
- app/(tools)/loan/page.tsx: dynamic import + inline JSON-LD script (dangerouslySetInnerHTML)
- components/features/loan/LoanPage.tsx: heavy client component with multiple useState, useMemo for inputFields (4 modes x 3 types), grids of cards, result subtree with multiple SVGs and cards. Many inline arrow onChange before optimizations.
- shared/ui/NumericInput.tsx and Input: re-render surface.
- components/ui/ToolPageShell.tsx: includes ShareResult (now dynamic in some states).
- features/loan/loan.logic.ts: pure, no issue.
- Related: dynamic SavedFinanceCalculations and bottom bar loaded on interaction.

## Relation to PR #91 (Quarantine)
PR #91 contains exactly the optimizations that target these hotspots:
- React.memo on NumericInput
- Stable fieldChangeHandlers useMemo in LoanPage
- Hoisted icon components (reduce duplicate SVG literals and element creation)
- Dynamic ShareResult in ToolPageShell

**Recommendation**: Review and consider merging PR #91 (after its own human approval) BEFORE additional /loan optimization work. It likely already reduces some TBT/main-thread cost. Duplicating its changes would be wasteful.

## Safe Optimization Sequence (post PR #91 review)
1. Defer non-critical result UI further (e.g. Saved only after result + idle).
2. Code-split result cards or use React.lazy for non-immediate parts.
3. Reduce first-load client tree (move some selectors if possible).
4. Profile with fresh Lighthouse + DevTools after PR #91.
5. Target per PR: 50-100ms TBT reduction.

## Measurable Targets
- Next small PR: document + any safe defer (if not in #91).
- Goal per step: measurable with Lighthouse warm run.

## Limitations
No fresh trace; relied on archived reports and code inspection + previous synthetic metrics (18 JS chunks, etc.).

## Files Inspected
- app/(tools)/loan/page.tsx
- components/features/loan/LoanPage.tsx
- features/loan/loan.logic.ts + test
- Note on PR #91 files.
