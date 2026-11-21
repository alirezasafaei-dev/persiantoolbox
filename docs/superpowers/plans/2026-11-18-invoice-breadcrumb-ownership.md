# Invoice breadcrumb ownership plan

Goal: one visible breadcrumb path and one BreadcrumbList on the invoice route,
with a single home link, registered financial category and current invoice.

Design: the route layout owns invoice navigation; let ToolPageShell opt out of
its inner breadcrumb without changing the default for other consumers. Derive
known tool breadcrumbs from registry metadata instead of incomplete path-parent
labels. The Breadcrumbs renderer already inserts home, so discard supplied root
items there. Remove the invoice route's redundant standalone BreadcrumbSchema;
retain ToolStructuredData as its structured-data owner. Tier and local-processing
badges remain. No dependency, financial behavior or ranking claim is included.

- [ ] Add regressions for supplied home and current invoice/category semantics; observe failures.
- [ ] Implement the scoped ownership and shared root normalization, then verify focused tests.
- [ ] Add composed invoice/layout acceptance for exactly one nav and one structured breadcrumb.
- [ ] Run final quick/contracts/build/standalone smoke and desktop/mobile browser checks.
- [ ] Independently review, security scan, sign and prepare a separate candidate; no release implied.

PR294 remains independently approved and merged; its deployment is blocked by
the unchanged npm audit result. Do not mix this new change into that release.
