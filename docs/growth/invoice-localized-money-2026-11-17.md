# Invoice localized monetary input repair

Production reproduced a zero total when ASCII price, tax and discount were
replaced by equivalent Persian digits. Both preview and PDF used ASCII-only
`parseFloat`. Reuse the existing `parseLooseNumber` in both paths so Persian,
Arabic and mixed digits and localized separators produce equivalent totals.
No dependency, shared parser, layout, premium gate or server processing changes.

Four regression cases cover ASCII, Persian, Arabic and mixed inputs. Three
localized cases failed before implementation; all passed afterward. Focused
verification passed 47 tests. Final local quick gate passed 2,221 tests across
288 files; contracts, production build and 11 canonical standalone smoke routes
passed. These results precede this evidence-only documentation addition.

Actual Chrome download from the standalone build produced a 162,548-byte PDF.
Poppler rendered it successfully and visual inspection confirmed subtotal
150,000, tax 15,750, discount 5,000 and payable 160,750 for quantity 1.5,
Persian price 100,000 and Persian tax 10.5%. The browser download event wait
timed out, but the resulting file was observed on disk and that actual file
was rendered. Python text extraction was not run because Python was unavailable.
The existing focused tests independently verify exported numeric text.

Synthetic local PDF/screenshots stay outside Git. No paid credit or live
production mutation occurred. Production repair and exact-head hosted checks
remain separate gates. This defect is not established as the cause of the
observed mobile search-click decline.

The original standalone invoice candidate encountered Next.js advisory
[GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h).
The original production dependency audit reported one moderate finding, patched
in 16.4.5. The combined focus candidate includes the independently reviewed
[Next.js patch](../ops/next-security-patch-2026-11-17.md). Its verification is
separate from these original invoice-only results; production is unchanged.
