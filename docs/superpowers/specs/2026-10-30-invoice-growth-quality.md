# Invoice growth quality

The owner approved the measurable organic-growth sprint on 2026-10-30. Current read-only Search Console evidence selected `/tools/invoice-generator` as the first existing tool to improve. Private exports and search metrics remain outside this repository.

The first deliverable improves the invoice journey: load PDF dependencies only when exporting; ensure zero or blank quantities produce the same totals in the preview and PDF; and show a Persian retryable error when export fails. Preserve the existing explicit-quantity arithmetic, local PDF generation, anonymous access, styling, route, metadata, and premium behavior.

Browser verification additionally found that the required regular TTF font had been deleted, preventing real downloads, and that the description input collapsed to 34px at a 382px mobile viewport. Restore the original upstream-verified regular font with its license and let the description span a full row on small screens; retain the desktop arrangement.

Use an import-time regression test to demonstrate that PDF libraries are deferred, and component tests to compare the displayed and exported zero, blank, and positive quantities, including tax and discount. Exercise failure and retry without sending document data anywhere. Verify real local browser export and mobile layout; preserve evidence of any browser or profiling limitation.

Run the repository's application gates, security scan, dependency audit, and secret scan before a signed commit. A task branch may be pushed and a draft PR prepared under repository governance. No merge or deployment is authorized. Do not claim rankings, conversion uplift, field performance, or production remediation from local evidence.
