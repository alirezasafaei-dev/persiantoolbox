# Tools layout stability: bounded growth quality correction

Base: deployed main `472fcafc2ce9d968f2f27dda82ebfa94af4b4c7a`. Work in the existing isolated worktree on `codex/growth-layout-stability-20261108`. Payroll legal research remains stopped at the owner's request.

## Evidence and design

Six fresh public `/tools` loads recorded mobile CLS 0.2288, 0.2288 and 0.1684; desktop 0, 0 and 0.1213. Shift sources show navigation brand wrapping and the tool status strip changing rows as fonts arrive. A browser-only blocked-font control had CLS 0 at both widths; switching font-display alone did not solve it and is rejected. A browser-only layout prototype with unchanged fonts reduced delayed-font CLS to 0.0100 at 390px and 0.0361 at 1440px.

Use the approved existing visual direction: retain fonts, palette, labels, destinations, calculations, consent and premium behavior. Give the brand icon stable width and keep the narrow-screen brand title on one line at an appropriate size. Make the tool-shell breadcrumb a full-width row with predictable badge columns on small screens, retaining wrapping for long statuses and the existing desktop arrangement. Do not hide content or replace CLS thresholds with retries. This is a scoped repair, not a global font or breakpoint change.

## Execution

- [x] Measure live baseline and isolate competing causes privately.
- [x] Extend the existing layout browser test with delayed local fonts; observe failure on the unchanged build.
- [x] Correct `components/ui/Navigation.tsx`, `components/ui/ToolsRouteShell.tsx` and the tool dashboard category layout. The first candidate passed mobile but retained desktop CLS 0.1218; attribution proved a category button moved horizontally by 165px. Use fixed category columns at tablet/desktop widths to remove this row-fit instability without changing labels or fonts.
- [x] Verify built layout/search at 320/360/390/768/1440, navigation, RTL, light/dark and keyboard access. Run quick, contracts, build and canonical standalone smoke.
- [ ] Independent review, staged/security/licensing checks, signed task commit and reviewable PR with exact-head checks.

Private evidence stays outside Git under the existing local evidence directory. No traffic, field-CWV or ranking gain is claimed from these lab samples. New merge/deployment requires separate concrete owner approval.
