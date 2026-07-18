# Plausible 30-day pilot

## Status

The integration is **off by default** and does not change production behavior until both
`NEXT_PUBLIC_PLAUSIBLE_ENABLED=1` and a valid `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` are supplied.
Creating the Plausible account, starting the trial, changing production environment variables,
and deploying remain manual release actions.

## Safety contract

- The script is loaded only after the existing v2 analytics consent is granted.
- Automatic pageviews are disabled. The integration sends pathname plus only `ref`, `source`, and
  standard `utm_*` attribution parameters; all other query parameters are removed.
- Custom events use a fixed event map and property allowlist. Free text, document contents, file
  names, addresses, salary/payment amounts, identifiers, and arbitrary metadata are not accepted.
- The script URL must use HTTPS, host `plausible.io`, and path `/js/*`. Credentials, query strings,
  fragments, and alternate hosts are rejected.
- Plausible is allowed in CSP only while the pilot is explicitly enabled.
- GA4 and same-origin analytics remain unchanged during the pilot.

## Event map

| Existing event      | Plausible event   | Allowed properties                                 |
| ------------------- | ----------------- | -------------------------------------------------- |
| `tool_run`          | `Tool Start`      | category, toolId/tool_id, product, source          |
| `tool_result_view`  | `Tool Complete`   | category, toolId/tool_id, product, source, status  |
| `export_confirm`    | `Result Export`   | product, format, source, status, isFree, isPremium |
| `blog_article_view` | `Article View`    | category, source                                   |
| `cta_click`         | `CTA Click`       | location, source, product                          |
| `checkout_start`    | `Checkout Start`  | product, source, isFree, isPremium                 |
| `payment_success`   | `Payment Success` | product, source, status                            |

Property strings are restricted to 80 characters and slug/path-safe characters. Numeric values are
not forwarded, preventing accidental transmission of salary, invoice, or payment amounts.

## Trial activation checklist

1. Start the 30-day trial with the project owner account and add `persiantoolbox.ir`.
2. In Plausible, open **Site Settings → General → Site Installation** and copy the exact public
   script URL. Never store account credentials or API keys in Git or Notion.
3. Set the two public variables in the candidate environment. Do not enable automatic form, file,
   or outbound-link capture in Plausible during this pilot.
4. Build and verify the candidate, then deploy only after explicit production approval.
5. In a consent-accepted browser, verify one pageview and each mapped event. In a rejected-consent
   browser, verify zero requests to `plausible.io`.
6. Test the script and event endpoint from at least two Iranian networks (mobile and fixed/VPN-off).

## 30-day decision scorecard

Record results weekly, using the same timezone and event definitions for both systems.

| Metric                 | Acceptance criterion                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Consent rejection      | Zero Plausible requests                                                                      |
| Sensitive-data leakage | Zero prohibited properties or query parameters                                               |
| Event accuracy         | At least 98% of audited test actions counted once                                            |
| Pageview duplication   | Less than 1% duplicate audited pageviews                                                     |
| Performance            | No material regression in the repository performance budget or mobile Lighthouse             |
| Iran reachability      | Script and event requests succeed on the tested networks                                     |
| Attribution            | UTM/referral reports are actionable and definitions match the publishing calendar            |
| Decision value         | At least one content or funnel decision can be made more clearly than with GA4/internal data |

At day 30 choose one long-term topology: Plausible plus internal product analytics, or GA4 plus
internal product analytics. Do not keep all three indefinitely without a documented reason.

## Rollback

Set `NEXT_PUBLIC_PLAUSIBLE_ENABLED=0`, rebuild the candidate, and use the normal reviewed release
process. No database rollback is required. The integration never writes Plausible credentials or
Stats API keys to the application.
