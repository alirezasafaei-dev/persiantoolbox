# نقشه راه کامل Production-Grade — PersianToolbox → نمره ۱۰/۱۰

**نسخه:** 1.0  
**تاریخ:** 2026-07-09  
**مالک محصول:** PersianToolbox (`persiantoolbox.ir`)  
**پلتفرم:** ASDEV (GitHub SoT · AUTOMATION_HOST · public VPS `ubuntu@live`)  
**قاعده اجرا:** همه مراحل آماده‌سازی و کیفیت **قبل** از دیپلوی؛ دیپلوی **آخرین** مرحله هر فاز است.

---

## ۱. اهداف کلان (Objectives)

| ID | هدف | معیار موفقیت (Definition of Done) |
|----|------|-----------------------------------|
| O1 | **پایداری عمومی** | uptime عمومی ≥ ۹۹٫۵٪ ماهانه؛ بدون 502 پایدار؛ ready/health عمومی 200 |
| O2 | **سئو قابل‌اندازه‌گیری** | GSC: رشد کلیک ۲۸روزه؛ CTR صفحات کلیدی ≥ ۸٪؛ sitemap errors=0؛ warnings در حال کاهش |
| O3 | **اعتماد قابل‌اثبات** | بدون testimonial جعلی؛ ادعاهای حریم خصوصی با `/trust` هم‌خوان؛ Enamad/تماس شفاف |
| O4 | **UX سبک و محصول‌محور** | صفحه اصلی بدون شلوغی غیرضروری؛ مسیر «پیدا کن → استفاده → اعتماد» |
| O5 | **کیفیت محتوا** | هر tool: intro + steps + FAQ≥2؛ بدون keyword stuffing |
| O6 | **دسترس‌پذیری** | focus-visible؛ labelهای فرم؛ skip-link؛ کنتراست پایه WCAG AA |
| O7 | **عملیات production-grade** | blue-green deploy؛ rollback؛ health gate؛ گزارش release |
| O8 | **نمره محصول** | مسیر: ۶٫۲ → ۷٫۵ → ۸٫۵ → ۹٫۵ → **۱۰** فقط با شواهد (نه ادعا) |

### نمره هدف مرحله‌ای

| مرحله | نمره هدف | شرط اعلام |
|--------|----------|-----------|
| P0 Baseline | ۶٫۲ | ممیزی اولیه |
| P1 Quality pack | ~۷٫۵ | کد روی GitHub + تست سبز |
| P2 Live deploy + smoke | ~۸٫۰ | public ready 200 + smoke صفحات کلیدی |
| P3 SEO/GSC hardening | ~۸٫۷ | meta/GSC actions + coverage |
| P4 Trust + a11y + CWV | ~۹٫۳ | trust واقعی + CWV سبز موبایل |
| P5 Production maturity | **۱۰٫۰** | ۳۰ روز پایداری + SLO + محتوای عمیق + بدون residual بحرانی |

---

## ۲. معماری اجرا (Production topology)

```
GitHub (persiantoolbox main)  ──SoT──►  OWNER_PC / AUTOMATION_HOST
                                              │
                    rsync + build + pm2        │
                                              ▼
                         LIVE VPS (DNS public)
                         nginx :80/:443
                              │
                              ▼
                         127.0.0.1:3000 (blue/green)
```

**نکته حیاتی (یافته عملیاتی):**  
هاست ASDEV IRAN (`asdev` app-layer `:3100`) **با** هاست عمومی DNS (`ubuntu` + nginx → `:3000`) **یکی نیست**.  
دیپلوی عمومی **باید** روی هاست `ubuntu@public` با `deploy-blue-green.sh` انجام شود.

---

## ۳. فازها، مراحل، تسک‌ها، چک‌لیست

### فاز P0 — کشف و قفل واقعیت (Discovery Lock)

**هدف:** یک تصویر واحد از «کجا live است / چه چیزی gate است / چه چیزی GSC می‌گوید».

| # | تسک | خروجی | وضعیت |
|---|-----|--------|--------|
| P0.1 | ممیزی SEO/UX/اعتماد (baseline) | نمره ۶٫۲، `AI_AGENT_TECHNICAL_AUDIT.md` | ✅ |
| P0.2 | اتصال و خواندن GSC | property `sc-domain:persiantoolbox.ir` | ✅ |
| P0.3 | شناسایی هاست عمومی vs ASDEV IRAN | DNS≠IRAN app-layer | ✅ |
| P0.4 | قفل دسترسی SSH public | `ubuntu` + `id_ed25519` | ✅ |
| P0.5 | ثبت نقشه راه | همین سند | ✅ (این فایل) |

**چک‌لیست P0**
- [x] GSC totals 28d/7d ثبت شد  
- [x] توپولوژی public vs ASDEV مستند شد  
- [x] مسیر دیپلوی public مشخص شد (`deploy-blue-green.sh`)  

---

### فاز P1 — کیفیت محصول روی GitHub (بدون دیپلوی)

**هدف:** کد main محصول آماده production؛ تست‌ها سبز.

| # | تسک | جزئیات | وضعیت |
|---|-----|--------|--------|
| P1.1 | Quality pack | homepage سبک‌تر، meta keywords حذف، trust دفاع‌پذیر | ✅ `bc1068c` |
| P1.2 | SEO content factory | هر tool: intro/FAQ/steps | ✅ `0c16bec`+fixes |
| P1.3 | Tier-aware trust shell | micro-copy بر اساس Offline/Hybrid/Online | ✅ |
| P1.4 | A11y utilities | focus-visible گسترده‌تر، `.tool-field-label` | ✅ |
| P1.5 | GSC-driven titles | OCR + آدرس فارسی→انگلیسی | ✅ `37ba347` |
| P1.6 | گزارش GSC | `docs/GSC_LIVE_STATS_20260709.md` | ✅ |
| P1.7 | Typecheck/tests | tsc + vitest مسیرهای کلیدی | ✅ (آخرین pack) |
| P1.8 | Soften absolute privacy | لینک `/trust` در ToolTrustBlock | ✅ |
| P1.9 | Popup pressure | delay بیشتر؛ exclude trust/contact | ✅ |

**چک‌لیست P1 (pre-deploy gate)**
- [x] `main` تمیز (بدون dirty ضروری)  
- [x] تست‌های unit مرتبط سبز  
- [ ] QA کامل اسکریپت blue-green (typecheck/lint/vitest/pwa) — **قبل از cutover**  
- [x] بدون secret در git  

---

### فاز P2 — آماده‌سازی عملیات Live (Pre-Deploy Ops)

**هدف:** زیرساخت live برای cutover امن.

| # | تسک | جزئیات | Owner |
|---|-----|--------|--------|
| P2.1 | Backup release فعلی | کپی/ثبت SHA فعلی blue (`46f633b…`) | ops |
| P2.2 | تأیید nginx upstream | `proxy_pass` → 3000/upstream | ops |
| P2.3 | تأیید www redirect | `www-redirect` site | ops |
| P2.4 | Disk/RAM headroom | ≥20% disk، RAM آزاد کافی برای build | ops |
| P2.5 | PM2 health | `persiantoolbox-blue` online؛ restart storm بررسی | ops |
| P2.6 | Env secrets | `.env` روی VPS (بدون commit) | ops |
| P2.7 | Rollback plan | نگه داشتن slot قبلی + `pm2` switch back | ops |
| P2.8 | ASDEV IRAN sync (اختیاری) | app-layer `:3100` برای control-plane | platform |

**چک‌لیست P2**
- [ ] `pm2 describe` بدون waiting restart loop شدید  
- [ ] `nginx -t` موفق (روی VPS)  
- [ ] SSL cert معتبر برای `persiantoolbox.ir`  
- [ ] مسیر rollback نوشته و تست‌پذیر  

---

### فاز P3 — دیپلوی Production (آخرین مرحله فاز)

**هدف:** انتشار `main@HEAD` روی public با blue-green.

| # | تسک | دستور/مسیر | معیار |
|---|-----|------------|--------|
| P3.1 | QA gate | داخل `deploy-blue-green.sh` | همه سبز |
| P3.2 | Rsync release | `/home/ubuntu/persiantoolbox-releases/<id>/` | کامل |
| P3.3 | Build remote | `pnpm install` + `pnpm build` + standalone | موفق |
| P3.4 | Start idle slot | green:3003 یا blue:3000 | health 200 |
| P3.5 | Nginx switch | upstream <1s | ترافیک جدید |
| P3.6 | Verify public | `/` + `/api/ready` + 5 صفحه GSC | 200 |
| P3.7 | Cleanup | stop old slot در صورت پایدار | ok |
| P3.8 | گزارش release | SHA + id + smoke | docs |

**چک‌لیست P3 (Go/No-Go)**
- [ ] QA gate 100% pass  
- [ ] New slot `/api/ready` = 200 قبل از switch  
- [ ] بعد switch: `https://persiantoolbox.ir/api/ready` = 200  
- [ ] صفحات: `/`, address, ocr, salary, check-penalty = 200  
- [ ] Error log بدون crash loop ۵ دقیقه  
- [ ] Rollback در ≤ ۲ دقیقه مستند  

**⛔ اگر هر مورد قرمز شد → switch نکن / rollback فوری.**

---

### فاز P4 — SEO & GSC Hardening (پس از دیپلوی پایدار)

| # | تسک | اولویت GSC | DoD |
|---|-----|------------|-----|
| P4.1 | تقویت meta/H1 صفحه OCR | impression بالا / CTR متوسط | CTR↑ |
| P4.2 | حفظ CTR آدرس؛ internal link از بلاگ | صفحه #1 کلیک | حفظ ≥20% CTR |
| P4.3 | حقوق/تأخیر چک: FAQ + schema | رتبه ~9–11 | ورود top10 پایدار |
| P4.4 | یکدست‌سازی www vs non-www | salary دو host | فقط apex |
| P4.5 | کاهش sitemap warnings (18) | Coverage | warnings↓ |
| P4.6 | Indexing: صفحات یتیم | sitemap | crawl depth ≤3 |
| P4.7 | Topic clusters | بلاگ↔ابزار | لینک دوطرفه |
| P4.8 | بازخوانی GSC هفتگی | automation | گزارش در git |

**چک‌لیست P4**
- [ ] GSC 7d vs 28d مقایسه ثبت شد  
- [ ] هیچ soft-404 روی URLهای top20  
- [ ] canonical یکتا برای صفحات کلیدی  

---

### فاز P4b — بلاگ Medium / product-led (بسته ارتقا)

**مرجع:** `docs/content/blog-medium-upgrade-docs.md` · `docs/content/blog-medium-agent-prompt.md` · `docs/content/blog-image-guidelines.md`

| # | تسک | DoD | وضعیت |
|---|-----|-----|--------|
| B1 | Visual system: cover در card/hero/home/list | cover اختیاری، fallback سالم | ✅ پایه موجود + تقویت prose |
| B2 | Schema BlogPosting + image | بدون fake rating | ✅ |
| B3 | راهنمای اسکرین‌شات واقعی | guidelines در git | ✅ |
| B4 | مقاله draft بصری وام | `published: false` + placeholder paths | ✅ |
| B5 | Editorial homepage `/blog` | hero + featured + hubs | ⏳ بعدی |
| B6 | Topic hubs `/blog/finance` … | ۶ هاب | ⏳ |
| B7 | ۸ مقاله pillar + screenshot واقعی | ۲–۳٫۵k کلمه + UI shots | ⏳ |
| B8 | Author/trust layer | bio + reviewedBy نمایش | ⏳ جزئی |
| B9 | CTA مسیرها با registry | resume→career-tools | ✅ بررسی شد |

**اصل:** اسکرین‌شات واقعی UI — نه استوک. داده شخصی ممنوع.

### فاز P5 — Trust, A11y, Performance

| # | تسک | DoD |
|---|-----|-----|
| P5.1 | فرآیند نظرات واقعی (نه placeholder) | فقط verified |
| P5.2 | فرم‌ها: label بیرون placeholder | WCAG |
| P5.3 | کنتراست + keyboard pass | checklist a11y |
| P5.4 | CWV موبایل (LCP/INP/CLS) | Lighthouse/field |
| P5.5 | کاهش JS/popup pressure | بدون exit spam |
| P5.6 | مانیتورینگ uptime (timer gate یا free probe) | alert |
| P5.7 | DR: backup + restore drill اپ | گزارش drill |
| P5.8 | بلاگ product-led (P4b) کامل | Medium-like + GSC |

**چک‌لیست P5**
- [ ] Lighthouse mobile Performance ≥ 75 (هدف ۹۰ برای ۱۰/۱۰)  
- [ ] Accessibility ≥ 90  
- [ ] Best Practices ≥ 90  
- [ ] SEO ≥ 90  

---

### فاز P6 — Production Maturity (اعلام ۱۰/۱۰)

| # | معیار اجباری ۱۰/۱۰ |
|---|---------------------|
| M1 | ۳۰ روز بدون outage بحرانی (یا postmortem مکتوب + fix) |
| M2 | GSC: رشد پایدار یا حداقل عدم سقوط impression/click |
| M3 | صفر ادعای trust غیرقابل دفاع |
| M4 | دیپلوی blue-green تکراری موفق (≥2 بار) |
| M5 | Rollback rehearsal موفق |
| M6 | نقشه راه و memory به‌روز |
| M7 | Owner sign-off روی چک‌لیست نهایی |

**چک‌لیست اعلام ۱۰/۱۰ (همه الزامی)**
- [ ] Public ready/health 200 پایدار  
- [ ] Top 10 GSC pages 200 + محتوای عمیق  
- [ ] CWV موبایل در بازه خوب  
- [ ] a11y pass  
- [ ] بدون restart storm PM2  
- [ ] GSC sitemap errors=0  
- [ ] سند release + postmortem خالی از SEV1 باز  

---

## ۴. صف کنترل‌پلن ASDEV (Agent assignment)

| Agent | مسئولیت | فاز |
|-------|----------|-----|
| `lead-platform-engineer` | orchestrate، دیپلوی، edge | P2–P3 |
| `deploy-agent` | blue-green / rollback | P3 |
| `sre-observer` | health، GSC fetch، uptime | P0,P4,P6 |
| `docs-memory-agent` | roadmap/memory/queue | همه |
| `product-quality` (interactive) | UX/trust/content | P1,P5 |

Queue IDs (نمونه موجود): edge prep، CWV after edge، verified reviews.

---

## ۵. ریسک‌ها و کنترل

| ریسک | شدت | کنترل |
|------|------|--------|
| دیپلوی روی هاست اشتباه (IRAN vs public) | بحرانی | فقط `deploy-blue-green.sh` برای public |
| PM2 restart storm (blue 2339 restarts) | بالا | قبل از cutover log + max_restarts |
| Build OOM روی VPS | متوسط | Node heap؛ disk free |
| SEO regress بعد از title change | متوسط | مانیتور GSC 7d |
| ادعای زودهنگام ۱۰/۱۰ | بالا | فقط چک‌لیست P6 |

---

## ۶. ترتیب اجرای عملی (الان)

```
1) قفل این roadmap در git          ← الان
2) اتمام QA + fix residual         ← قبل دیپلوی
3) P3 blue-green روی public VPS    ← آخرین مرحله این sprint
4) Smoke + گزارش release
5) P4/P5 حلقه بهبود بدون توقف
6) P6 فقط با شواهد ۳۰روزه برای «۱۰/۱۰»
```

### وضعیت sprint فعلی (2026-07-09)

| مورد | مقدار |
|------|--------|
| Product HEAD | `37ba347` (+ quality/SEO packs) |
| Public live (قبل cutover) | slot blue `46f633b…` · nginx→:3000 · https 200 |
| ASDEV IRAN app-layer | `:3100` (جدا از DNS عمومی) |
| GSC 28d | 145 clicks · 2283 imp · CTR 6.4% · pos 7.7 |
| نمره صادقانه فعلی | **~۷٫۵/۱۰** (کد) · **~۶٫۵–۷ SEO زنده** |
| اعلام ۱۰/۱۰ | **هنوز مجاز نیست** تا P3+P5+P6 |

---

## ۷. دستورات مرجع (Ops)

```bash
# Pre-deploy QA (local product)
cd sites/live/persiantoolbox
pnpm typecheck && pnpm lint && pnpm vitest --run

# Production blue-green (LAST step of phase)
ALLOW_DIRTY_DEPLOY=0 bash deploy-blue-green.sh

# Post-deploy smoke
curl -sS -o /dev/null -w "%{http_code}\n" https://persiantoolbox.ir/api/ready
curl -sS -o /dev/null -w "%{http_code}\n" https://persiantoolbox.ir/text-tools/address-fa-to-en
curl -sS -o /dev/null -w "%{http_code}\n" https://persiantoolbox.ir/tools/persian-ocr

# GSC (AUTOMATION_HOST with credentials)
# uses lib/server/google-search-console.ts / admin API / tsx fetch
```

---

## ۸. Definition of Done — این سند

- [x] اهداف، فازها، تسک‌ها، چک‌لیست‌ها، ریسک‌ها، توپولوژی  
- [x] تفکیک «کار کیفیت» و «دیپلوی آخر»  
- [x] معیار صریح ۱۰/۱۰  

**اصل:** کارخانه کیفیت و عملیات اول؛ دیپلوی فقط وقتی چک‌لیست pre-deploy سبز است؛ **۱۰/۱۰ فقط با شواهد، نه با فشار.**
