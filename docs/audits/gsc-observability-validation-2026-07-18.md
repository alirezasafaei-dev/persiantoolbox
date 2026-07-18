# GSC observability validation checklist — 2026-07-18

PR: #149  
Branch: `feat/gsc-observability`

## Automated checks

- TypeScript and production build
- Unit tests for comparison windows, page filters, opportunity scoring, and sitemap dates
- Security scan and secret scan
- Existing end-to-end suite

## Credential-backed checks

These checks must run only on a trusted local or server machine with the service-account key stored outside the repository:

- readonly verifier returns the expected Domain Property;
- current and previous 28-day totals load;
- query, page, device, and daily dimensions load;
- same-site page drilldown works;
- external-host page filters are rejected;
- no credential path, client email, private key, or token is emitted to browser payloads;
- Sitemap results load from the readonly API.

## Sitemap checks

- undated static routes omit `lastModified`;
- tools retain registry dates when maintained;
- blog posts retain published/modified dates;
- category/tag/blog index dates derive from actual posts;
- changing `NEXT_PUBLIC_BUILD_DATE` alone does not modify sitemap dates.

## Deployment boundary

No deployment, restart, environment mutation, Search Console write operation, or validation request is authorized by this checklist.
