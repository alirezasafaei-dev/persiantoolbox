# PersianToolbox — Production Live Verification (2026-10-09)

**Production URL:** https://persiantoolbox.ir
**Deployment window:** 2026-10-09 12:13–12:18 UTC
**Independent stabilization audit:** 2026-10-09 12:19–12:32 UTC
**Approved scope:** Blue-Green production deploy plus schema migration with public AI chat OFF; no public AI activation.

## Exact release and rollback identity

| Property | Verified value |
| --- | --- |
| GitHub main / deployed SHA | `07adf70d448656e83e226b7784d0cfb64de64694` |
| Previous production SHA | `57729e23342c2090e744ab62d4ae53c138a8e2bd` |
| Release ID | `production-manual-20261009T121310Z-07adf70d4486` |
| Production active slot | Blue, `127.0.0.1:3000` |
| Retained rollback slot | Green, `127.0.0.1:3004` |
| Canonical releases retained | 5 |
| Deployment engine | `ops/deploy/deploy-production-blue-green.sh` |
| Migration option | `--run-migrations true` |
| Deployment engine exit code | 0 |
| Public feature flag | `FEATURE_AI_CHAT_ENABLED=false` |
| Cloudflare Free attestation flag | `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=false` |

This was deployed directly from a clean isolated Git checkout of the immutable main SHA. The user's dirty working tree was not touched. The authoritative deployment engine performed candidate build, schema migration, candidate health and asset verification, additive static retention, traffic switch, two public verification runs, state persistence and rollback retention. No manual Nginx switch or independent deployment path was used.

## Database and protected configuration

- Existing validated pre-migration backup: `/home/ubuntu/backups/persiantoolbox-postgresql-20261009T114215Z.dump`, 73,634 bytes, permissions `0600`; isolated restore of 25 tables and 93 objects was reported separately by the authorized operator before deployment.
- Existing protected production environment backup: `production.env.pre-ai-chat-20261009T114331Z.bak`, permissions `0600`.
- The canonical migration runner logged both `Database schema applied` and `AI quota migration applied`.
- Independent production PostgreSQL read-only check: `public.ai_chat_quota` **exists**, three columns and **zero rows** at 12:32 UTC. PostgreSQL ready.
- Shared and deployed protected `.env` files retain owner `ubuntu`, mode `0600`, public-chat disabled and Free-attestation disabled.
- Public `POST /api/ai/chat` returned **HTTP 503** (disabled). No provider inference was sent during deployment acceptance testing. Cloudflare account Free/Billing tier remains unverified via API; public AI **must remain OFF**.

## Engine asset gates (PASS)

Before switching, existing Green passed verification. Candidate Blue then passed: health, five critical pages, two CSS files, 27 JavaScript assets, immutable release identity and cache headers. The engine checked the complete generated and standalone static manifests, retained shared static assets and validated Nginx. After the switch, the same five-page/CSS/JS public asset gate passed **twice**; release commit and state were persisted. Both Blue and Green remain online and healthy.

## Independent public HTTP and real-browser verification

**Browser:** installed Google Chrome, automated through Playwright 1.63 on authorized Windows machine (no browser software installed or production files modified).
**Viewports:** desktop 1365×840 / 1365×900, mobile 390×844 with touch emulation.

Route/URL coverage (overlap between groups; counts are individual checks, not necessarily unique URLs):

- Ten primary desktop routes: `/`, `/blog`, `/tools`, `/pricing`, `/salary`, `/topics`, `/ai`, `/ai/chat`, `/sitemap.xml`, `/robots.txt` — HTTP 200 with non-empty content.
- Ten published blog posts loaded in Chrome and returned HTTP 200 with article content: `url-encode-decode-for-persian-links`, `json-formatter-for-api-debugging`, `base64-encoding-is-not-encryption`, `hash-functions-practical-guide`, `create-safe-qr-codes-for-links-and-contact-info`, `create-strong-and-manageable-passwords`, `calculate-date-difference-for-projects-and-hr`, `convert-dates-for-contracts-and-international-forms`, `build-a-simple-monthly-personal-budget`, `compare-two-loans-by-total-cost`.
- Six mobile routes: `/`, `/blog`, `/pricing`, `/tools`, `/ai`, `/ai/chat` — HTTP 200 and no document-level horizontal overflow at width 390.
- Mobile navigation menu opened, exposed the Blog link and navigated successfully. Desktop Blog navigation link also clicked and navigated after the page completed loading.
- Fifteen internal footer links tested, all HTTP 200, including privacy, trust, terms, about, support and developers.
- Nine real major category routes tested successfully: text, PDF, image, date, contract, validation, SEO, career and writing tools.
- Three domain/canonical checks passed: `http://persiantoolbox.ir`, `http://www.persiantoolbox.ir` and `https://www.persiantoolbox.ir` resolved to canonical HTTPS and returned 200.
- Blog hard refresh successful.
- In the primary Chrome sweep: **zero page errors, zero Console errors and zero network request failures** observed.

### Representative tool interactions

- Base64: filled synthetic `ASDEV`, clicked Encode and confirmed output `QVNERVY=`.
- JSON Formatter: entered syntactically valid test JSON, clicked Format; confirmed valid input and UI response. The initial malformed-string assertion resulted from PowerShell/Node test harness quoting, not the application.
- Persian address converter: Persian state/city fields accepted test values.
- Check penalty: primary amount field accepted test input.
- Salary: changed gross-pay input to 23,000,000, blurred, recalculated, and confirmed the value remained 23,000,000.
- Loan calculator: populated loan amount/rate/term, clicked Calculate and confirmed output/content changed.
- Image resize: accepted an in-memory, synthetic 1-pixel PNG.
- Contract rental lease: accepted a synthetic name in the first form field.
- OCR: accepted a newly generated synthetic image with `HELLO ASDEV`, clicked Extract Text and detected `HELLO` in page output.
- No real user documents, files or PII were uploaded; no payment or persistent business write was performed.

### Warnings and limitations

1. A *noncanonical, guessed* `/financial-tools` URL returned 404. This URL was **not** found in the site navigation or sitemap; the actual linked `/topics/finance-tools` returned 200. This is an invalid test assumption, not evidence of a deployed route regression.
2. An initial desktop Blog test selector was invalid because its CSS quotes were stripped by a PowerShell invocation. The focused corrected real-browser click later **passed**.
3. OCR, calculator and contract tests used safe synthetic examples only. Every export, authentication, payment and less-used tool workflow was **not** exhaustively exercised.
4. A prior October 9 Green responsiveness incident self-recovered, with root cause still unproven. No new P0/P1 failure was observed in this release acceptance run.
5. Cloudflare Workers Free tier and billing safeguards are **not independently API-verified** (Account/Billing API 403 in earlier checks). Public AI activation is intentionally blocked until separate owner confirmation.

**Screenshots/traces:** not required for P0/P1 errors because no site-confirmed P0/P1 browser failures were observed in this test run. Runtime output was captured in the authorized operator session.

## Final stabilization and rollback checks (12:32 UTC)

- Public `/api/version` = exact deployed SHA; public `/api/health` = `status=ok`, `ready=true`.
- Blue health HTTP 200 (0.024s), Green rollback health HTTP 200 (0.059s).
- Nginx routes to `127.0.0.1:3000`; Nginx and PM2 active; PostgreSQL accepts connections.
- `ai_chat_quota`: exists with three columns and zero rows; public chatbot API HTTP 503 while disabled.
- Production disk used about 79%, approximately 10 GiB filesystem free. Five releases retained; previous release still restartable and available for canonical rollback.
- **No rollback was executed or needed.** Public activation of AI was not authorized and not attempted.

## Acceptance verdict

LIVE_VERIFICATION_PASS_WITH_WARNINGS
