# Commercial Licensing

## Status

- Current versions (`<= v1.1.x`) remain under MIT.
- Commercial licensing track is prepared for `v2.0.0+`.

## When You Need a Commercial License

A commercial license is required for:

- SaaS/public services based on Persian Tools
- Client work and paid delivery
- Internal organizational use in business operations
- Any revenue-generating deployment (ads/subscription/sponsorship)
- White-label redistribution

## Evaluation

Short non-production evaluation is allowed for technical fit checks.

## License Issuance Process

For each approved commercial request, issue a license record with these fields:

- `licenseId` (unique)
- `issuedAt` (UTC timestamp)
- `buyerName`
- `buyerEmail`
- `organization` (optional for individual)
- `allowedUse` (SaaS / Internal / Client Delivery / White-label)
- `deploymentScope` (domains/services/environments)
- `versionScope` (licensed version range)
- `supportScope` (optional)
- `expiresAt` (optional)

### License Record Template

```text
License ID:
Issued At:
Buyer Name:
Buyer Email:
Organization:
Allowed Use:
Deployment Scope:
Version Scope:
Support Scope:
Expires At:
Notes:
```

### Operational Flow

1. Confirm use-case against commercial criteria.
2. Issue license record with fields above.
3. Deliver license text + invoice/reference to buyer.
4. Store issuance log in private billing records.

## Contact

Use the project owner channels listed in repository profile for commercial inquiries.

## FAQ

### What scope does a license cover?

License scope is defined in the issuance record (`deploymentScope`, `allowedUse`, `versionScope`).

### Does the license include future major versions?

Only if explicitly written in `versionScope`. Default is fixed to the purchased range.

### Is support included?

Support is optional and must be explicitly listed in `supportScope`.

### Can a license be transferred to another company?

No. Transfer requires a new approval and re-issuance under a new `licenseId`.

### What if service is discontinued?

Commercial terms remain governed by the issued license record and invoice terms. Renewal/cancellation details should be agreed before issuance.
