# Analytics Ingest Security Model

## Objective

Ensure analytics ingest works without exposing server secrets to clients.

## Model

- Public client identifier: `NEXT_PUBLIC_ANALYTICS_ID`
- Server-side ingest secret: `ANALYTICS_INGEST_SECRET`
- Secret must be sent only from trusted server-side contexts using header `x-pt-analytics-secret`.

## Production Rules

- If analytics is enabled in production, ingest secret is mandatory.
- Requests with missing/invalid secret are rejected.
- Consent metadata is mandatory for all events.
- Oversized batches are rejected.

## Security Guarantees

- No secret in client bundle.
- No ingest/read access without admin + secret gates.
- Payload-level privacy controls via allowlists and consent contract.
