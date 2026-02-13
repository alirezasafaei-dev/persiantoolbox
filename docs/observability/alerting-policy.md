# Alerting Policy

## Severity Levels

- `P1`: total outage, auth failure, payment/webhook failure, sustained 5xx surge.
- `P2`: degraded performance, partial route outage, elevated error budget burn.
- `P3`: non-critical anomaly, delayed background jobs, transient integration failures.

## Trigger Rules

- Error rate > 1% for 5 minutes -> `P1`
- p95 latency > 1200ms for 10 minutes -> `P2`
- Lighthouse accessibility or SEO below 0.90 in release checks -> `P2`
- Backup restore failure in staging drill -> `P1`

## Notification Flow

- P1: immediate page + incident channel.
- P2: incident channel + owner acknowledgment in 15 minutes.
- P3: ticket queue + next business day triage.
