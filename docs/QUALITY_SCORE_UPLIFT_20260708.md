# PersianToolbox Quality Score Uplift Plan & Progress

**Date:** 2026-07-08  
**Baseline (owner + audit):** **6.2 / 10**  
**After this code pack (honest pre-prod):** **~7.1 / 10 estimated**  
**Path to 10/10:** multi-phase; not a single PR

---

## Score trajectory

| Area | Baseline | After pack | Path to 9–10 |
|------|---------:|-----------:|--------------|
| Product idea | 7.5 | 7.5 | authority content, less tool spam |
| SEO | 6.0 | **6.6** | deep tool pages, clusters |
| UX | 6.5 | **7.3** | lighter home, fewer popups |
| UI | 6.8 | 7.0 | brand system pass later |
| Persian content | 6.0 | **6.6** | less hype, half-space discipline ongoing |
| Trust | 5.8 | **7.0** | verifiable claims + /trust |
| Technical reliability | 5.5 | **6.5*** | *app-layer stable; public edge still risk |
| A11y | 5.5 | 6.0 | form labels sitewide next |
| Ads/revenue | 5.8 | 5.8 | placement QA later |
| Brand potential | 6.5 | 6.8 | identity + case studies |

\*Public site may still show 502 if edge/upstream not ASDEV-managed; app-layer on IRAN `:3100` is healthy.

---

## Code changes this pack

- Homepage: remove NewTools, Newsletter, SocialProof sections (less cognitive load)
- Copy: shorter meta title; defensible trust language; fewer pills
- SEO: remove `keywords` meta from layout/home
- Trust blocks: precise claims + link to `/trust`
- Popups: higher delay thresholds; exclude `/trust` `/contact`
- Testimonials section: no faux quote styling for non-user quotes

---

## What still blocks 10/10

1. **Public edge reliability** (502 in external audit) — needs `APPROVE_CRITICAL_SITE_PUBLIC_EDGE` + monitoring  
2. **Systemic tool-page SEO depth** for 80+ tools (templates + content factory)  
3. **Verified social proof** only  
4. **CWV measurement** under public URL after edge  
5. **Sitewide form label** a11y pass  

---

## Agent context

Use with `docs/AI_AGENT_TECHNICAL_AUDIT.md`. Prefer depth over new tools.
