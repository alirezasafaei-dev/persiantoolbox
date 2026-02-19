# Request Observability Baseline

- Request ID header: `x-request-id`
- Generated at edge proxy and propagated to API routes via request headers.
- API logs are emitted as JSON lines for machine-readable correlation.

Example record:

```json
{
  "ts": "2026-02-19T00:00:00.000Z",
  "requestId": "...",
  "method": "POST",
  "route": "/api/analytics",
  "event": "response",
  "status": 200
}
```

Operational notes:

- Keep logs same-origin/local and avoid third-party ingestion dependency.
- Correlate incidents by `requestId` across proxy/API logs.
