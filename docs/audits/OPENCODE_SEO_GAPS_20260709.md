# SEO Gaps Report — PersianToolbox (GSC-driven)

**Date:** 2026-07-09  
**Authors:** Grok orchestrator (+ attempted OpenCode worker; worker stalled on nested Explore agents)  
**Property:** `sc-domain:persiantoolbox.ir`  
**Live pin note:** public may lag GitHub `main`  
**Do not claim 10/10.**

---

## Snapshot (GSC)

| Window | Clicks | Impressions | CTR | Avg pos |
|--------|-------:|------------:|----:|--------:|
| 28d | 145 | 2283 | 6.4% | 7.7 |
| 7d | 63 | 692 | 9.1% | 8.6 |

**Top demand:** OCR فارسی · تبدیل آدرس فارسی به انگلیسی · چک/حقوق  

**Sitemap:** ~433 URLs · **errors=0** · **warnings=18** (needs reduction)

---

## Code facts (current `main`)

| Area | Status | Path |
|------|--------|------|
| Apex brand URL | `https://persiantoolbox.ir` | `lib/brand.ts` `BRAND.baseUrl` |
| `metadataBase` + root canonical | apex `siteUrl` | `app/layout.tsx` |
| Page canonical helper | `buildMetadata` → `alternates.canonical` absolute | `lib/seo.ts` |
| Robots | present | `app/robots.ts` |
| Sitemap | dynamic | `app/sitemap.ts` |
| Route redirects | many legacy paths | `next.config.mjs` `redirects()` |
| www→apex in Next | **not in next.config** (edge/nginx responsibility) | public VPS nginx |

---

## Prioritized backlog

### P0 — Index consistency / traffic protection

1. **www vs non-www (GSC split risk)**  
   - **Symptom (historical):** salary/other URLs seen under both hosts.  
   - **App:** canonicals use apex via `siteUrl`.  
   - **Edge:** ensure nginx `www-redirect` site always 301 → apex (ops; not a code-only fix).  
   - **DoD:** GSC shows single host; no www URLs in top pages.  
   - **Owner:** ops on public VPS (no code deploy required for redirect-only).

2. **Public release lag vs GitHub SEO packs**  
   - Live ~`37ba347`; main advanced (GSC titles, content factory, blog hubs, a11y).  
   - **DoD:** after complete-work gate, blue-green to HEAD with inspect scrub (`d0ae88f+`).  
   - **Rule:** deploy last.

3. **Sitemap warnings (18)**  
   - Investigate GSC Coverage “Submitted URL has issue” / alternate page / redirect.  
   - **Files:** `app/sitemap.ts`, `next.config.mjs` redirects, soft-404 candidates.  
   - **DoD:** warnings trend down week-over-week.

### P1 — CTR & ranking for money queries

4. **OCR cluster** (`/tools/persian-ocr`, blog OCR guide)  
   - High impressions; CTR room.  
   - Strengthen H1/title consistency, internal links blog↔tool, FAQ schema if missing on page.  
   - Paths: tool page + `components/features/pdf-tools/PersianOcr.tsx` + blog slug.

5. **Address FA→EN** (`/text-tools/address-fa-to-en`)  
   - Best CTR page — protect; add related internal links from home/blog; avoid title thrash.

6. **Check penalty / salary**  
   - Position ~9–11 zone historically — deepen FAQ + HowTo schema; unique intro (content factory already base layer).

7. **Thin / orphan risk**  
   - Tools with only factory boilerplate: prioritize top GSC impressions first.  
   - Ensure sitemap entries have crawl depth ≤3 from home/category hubs.

### P2 — Structural SEO

8. **FAQPage JSON-LD** on tool shells where FAQ ≥2  
   - Centralize in tool page shell / SEO helpers (`lib/seo.ts` structured data section).

9. **Blog topic hubs** (`/blog/topic/*`)  
   - Keep hub↔article↔tool bidirectional links (P4b).  
   - Avoid soft-404 empty hubs.

10. **RSS + Open Graph images**  
    - Root has RSS alternate; blog covers optional — continue product-led covers without stock.

---

## Optional one-line safe code fixes (next iterations)

| Fix | Why | Risk |
|-----|-----|------|
| Assert `siteUrl` never ends with trailing slash inconsistently | canonical dup | low |
| Unit test: all registry tools have sitemap entry | coverage | low |
| Add `www` host redirect test in deploy smoke | edge drift | ops |

No code change bundled in this report commit beyond documentation (worker stalled).

---

## Multi-agent note

- **OpenCode v1/v2:** hung after spawning nested “Explore Agent”; logs frozen.  
- **Mitigation:** future missions must set model/agent that cannot spawn subagents, or use `mimo run` for docs-heavy SEO audits (mimo completed quality audit successfully).  
- Orchestrator wrote this report to keep AUTO LOOP moving.

---

## SUMMARY

- Apex canonical model is correct in app code.  
- Highest leverage: **edge www redirect proof** + **deploy HEAD after quality complete** + **sitemap warning burn-down** + **OCR/check content depth**.  
- Score path remains evidence-based; not 10/10.
