#!/usr/bin/env python3
"""
Fast Live Site Tests — PersianToolbox
Runs all critical checks in under 60 seconds.
"""
import requests
import re
import json
import time
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

BASE = "https://persiantoolbox.ir"
P, F, W = 0, 0, 0
errs, warns = [], []

def ck(ok, label, detail="", sev="fail"):
    global P, F, W
    if ok:
        P += 1; print(f"  ✅ {label}", flush=True)
    elif sev == "warn":
        W += 1; warns.append(f"{label}: {detail}"); print(f"  ⚠️  {label} — {detail}", flush=True)
    else:
        F += 1; errs.append(f"{label}: {detail}"); print(f"  ❌ {label} — {detail}", flush=True)

def get(path, timeout=10):
    return requests.get(f"{BASE}{path}", timeout=timeout, allow_redirects=True)

print("=" * 60, flush=True)
print("🔍 PersianToolbox Live Tests", flush=True)
print("=" * 60, flush=True)
start = time.time()

# =============================================
# 1. ALL ROUTES (parallel)
# =============================================
print("\n📄 1. ALL ROUTES", flush=True)
routes = [
    "/", "/topics", "/search", "/pricing", "/salary", "/loan",
    "/pdf-tools", "/image-tools", "/date-tools", "/text-tools",
    "/validation-tools", "/blog", "/guides", "/privacy", "/terms",
    "/about", "/contact", "/support", "/trust", "/compare",
    "/developers", "/how-it-works", "/use-cases", "/plans",
    "/market", "/text-tools/word-counter", "/date-tools/shamsi-gregorian",
    "/image-tools/image-background-remover", "/pdf-tools/compress/compress-pdf",
    "/tools/invoice-generator", "/tools/tax-calculator", "/tools/mahr-calculator",
    "/validation-tools/image-to-qr", "/tools/persian-ocr",
    "/interest", "/asdev", "/refer",
]

def check_route(path):
    try:
        r = get(path, timeout=8)
        return path, r.status_code, None
    except Exception as e:
        return path, -1, str(e)[:50]

with ThreadPoolExecutor(max_workers=8) as ex:
    futures = {ex.submit(check_route, r): r for r in routes}
    results = {}
    for f in as_completed(futures):
        path, status, error = f.result()
        results[path] = (status, error)

fail_count = 0
for r in routes:
    status, error = results.get(r, (-1, "timeout"))
    if status == 200:
        pass
    else:
        fail_count += 1
        ck(False, f"{r}", f"HTTP {status}" if status > 0 else error)

ck(fail_count == 0, f"All {len(routes)} routes return HTTP 200",
   f"{fail_count} failed")

# =============================================
# 2. SECURITY HEADERS
# =============================================
print("\n🔒 2. SECURITY HEADERS", flush=True)
for r in ["/", "/pricing", "/salary"]:
    h = get(r, timeout=8).headers
    ck(h.get("X-Content-Type-Options") == "nosniff", f"{r} X-Content-Type-Options")
    ck(h.get("X-Frame-Options") == "DENY", f"{r} X-Frame-Options")
    ck("strict-origin" in (h.get("Referrer-Policy") or ""), f"{r} Referrer-Policy")
    ck("max-age" in (h.get("Strict-Transport-Security") or ""), f"{r} HSTS")

# =============================================
# 3. CSS & STATIC ASSETS
# =============================================
print("\n🎨 3. CSS & STATIC ASSETS", flush=True)
r = get("/")
soup = BeautifulSoup(r.text, "html.parser")

css_tags = soup.find_all("link", rel="stylesheet")
ck(len(css_tags) > 0, f"HTML has {len(css_tags)} stylesheet links")

for tag in css_tags[:2]:
    href = tag.get("href", "")
    if href.startswith("/"):
        cr = get(href, timeout=8)
        ck(cr.status_code == 200, f"CSS {href[:30]} served")

for font in ["/fonts/Vazirmatn-Bold.woff2", "/fonts/Vazirmatn-Regular.woff2"]:
    fr = get(font, timeout=8)
    ck(fr.status_code == 200, f"Font {font.split('/')[-1]}")
    ck(len(fr.content) > 10000, f"Font has content ({len(fr.content)} bytes)")

# =============================================
# 4. SEO — 10 PAGES
# =============================================
print("\n🔍 4. SEO", flush=True)
for p in ["/", "/pricing", "/salary", "/topics", "/blog", "/privacy", "/pdf-tools"]:
    try:
        r = get(p, timeout=8)
        s = BeautifulSoup(r.text, "html.parser")
        ck(s.find("title") is not None, f"{p} — title")
        ck(s.find("meta", attrs={"name": "description"}) is not None, f"{p} — meta desc")
        ck(s.find("link", rel="canonical") is not None, f"{p} — canonical")
        # JSON-LD: BS4 may miss RSC-format scripts, use regex as fallback
        jsonld_bs4 = len(s.find_all("script", type="application/ld+json"))
        jsonld_regex = len(re.findall(r'application/ld\+json', r.text))
        jsonld_count = max(jsonld_bs4, jsonld_regex)
        ck(jsonld_count > 0, f"{p} — JSON-LD ({jsonld_count} schemas)")
        ck(s.find("html", lang="fa") is not None, f"{p} — lang=fa")
    except Exception as e:
        ck(False, f"{p} SEO", str(e)[:40])

# =============================================
# 5. HOMEPAGE
# =============================================
print("\n🏠 5. HOMEPAGE", flush=True)
r = get("/")
text = BeautifulSoup(r.text, "html.parser").get_text()
ck("ابزارهای فارسی" in text, "Hero headline")
ck("مسیر شما" in text or "کارمند" in text, "Role-based paths")
ck("پردازش ۱۰۰٪ محلی" in text, "Trust: local processing")
ck("دسته‌بندی ابزارها" in text, "Categories section")
ck("سؤالات متداول" in text or "FAQ" in r.text, "FAQ section")
ck("/topics" in [a.get("href") for a in BeautifulSoup(r.text, "html.parser").find_all("a", href=True)], "Nav → /topics")

# =============================================
# 6. PRICING
# =============================================
print("\n💰 6. PRICING", flush=True)
r = get("/pricing")
text = BeautifulSoup(r.text, "html.parser").get_text()
ck("رایگان" in text, "Free tier")
ck("حرفه‌ای" in text, "Pro tier")
ck("کسب‌وکار" in text or "API" in text, "Business tier")
ck("سؤالات متداول" in text, "FAQ")

# =============================================
# 7. SEARCH
# =============================================
print("\n🔍 7. SEARCH", flush=True)
r = get("/search")
s = BeautifulSoup(r.text, "html.parser")
ck(s.find("input", {"aria-label": "جستجوی ابزارها"}) is not None, "Search input with aria-label")
ck("ابزارهای محبوب" in s.get_text(), "Popular tools zero-state")

# =============================================
# 8. TOOL PAGES (5 samples)
# =============================================
print("\n🔧 8. TOOL PAGES", flush=True)
for path, name in [("/salary", "Salary"), ("/loan", "Loan"),
                    ("/tools/invoice-generator", "Invoice"),
                    ("/pdf-tools/compress/compress-pdf", "PDF Compress"),
                    ("/tools/tax-calculator", "Tax Calc")]:
    r = get(path, timeout=8)
    s = BeautifulSoup(r.text, "html.parser")
    ck(r.status_code == 200, f"{name} loads")
    ck(s.find("h1") is not None, f"{name} — H1")
    ck(len(s.find_all("script", type="application/ld+json")) > 0, f"{name} — JSON-LD")
    ck(len(s.find_all("nav", attrs={"aria-label": "مسیر ناوبری"})) > 0, f"{name} — breadcrumb")

# =============================================
# 9. INTERNAL LINKS (homepage)
# =============================================
print("\n🔗 9. INTERNAL LINKS", flush=True)
r = get("/")
soup = BeautifulSoup(r.text, "html.parser")
links = set()
for a in soup.find_all("a", href=True):
    h = a["href"]
    if h.startswith("/") and "#" not in h:
        links.add(h.split("?")[0])

print(f"  {len(links)} unique links on homepage", flush=True)
broken = []
def chk(l):
    try:
        return l, get(l, timeout=6).status_code
    except:
        return l, -1

with ThreadPoolExecutor(max_workers=8) as ex:
    for l, s in ex.map(lambda x: chk(x), links):
        if s >= 400 or s == -1:
            broken.append((l, s))

ck(len(broken) == 0, f"All {len(links)} homepage links valid",
   f"{len(broken)} broken: {broken[:3]}")

# =============================================
# 10. API
# =============================================
print("\n🔌 10. API", flush=True)
for ep in ["/api/health", "/api/ready"]:
    r = get(ep, timeout=8)
    ck(r.status_code == 200, f"{ep} — 200")
    ck("no-store" in r.headers.get("Cache-Control", ""), f"{ep} — no-store")
    ck("noindex" in r.headers.get("X-Robots-Tag", ""), f"{ep} — noindex")

r = get("/api/health")
data = r.json()
ck(data.get("status") == "ok", "Health status=ok")
ck("version" in data, "Health has version")
ck("node" in data, "Health has node")

# =============================================
# 11. REDIRECTS
# =============================================
print("\n↪️  11. REDIRECTS", flush=True)
for src, dst in [("/tools-dashboard", "/tools"), ("/salary-calculator", "/salary"),
                 ("/loan-calculator", "/loan"), ("/image-compress", "/image-tools")]:
    try:
        r = requests.get(f"{BASE}{src}", timeout=6, allow_redirects=False)
        ck(r.status_code in (301,302,307,308), f"{src} redirects", f"got {r.status_code}")
    except Exception as e:
        ck(False, f"Redirect {src}", str(e)[:40])

# =============================================
# 12. FORMS
# =============================================
print("\n📝 12. FORMS", flush=True)
r = get("/search")
s = BeautifulSoup(r.text, "html.parser")
inp = s.find("input", {"aria-label": "جستجوی ابزارها"})
ck(inp is not None, "Search input exists")
ck(inp.get("type") == "text" if inp else False, "Search type=text")

# =============================================
# 13. BLOG
# =============================================
print("\n📰 13. BLOG", flush=True)
r = get("/blog")
s = BeautifulSoup(r.text, "html.parser")
ck(r.status_code == 200, "Blog loads")
article_links = [a for a in s.find_all("a", href=True) if "/blog/" in a.get("href", "")]
ck(len(article_links) > 0, f"Blog has {len(article_links)} articles")

# =============================================
# 14. TRUST PAGES
# =============================================
print("\n🛡️  14. TRUST", flush=True)
for p, kws in [("/privacy", ["حریم خصوصی", "پردازش محلی"]),
               ("/trust", ["شفافیت"]), ("/terms", ["قوانین"])]:
    r = get(p, timeout=8)
    text = BeautifulSoup(r.text, "html.parser").get_text()
    ck(r.status_code == 200, f"{p} loads")
    for kw in kws:
        ck(kw in text, f"{p} — '{kw}'")

# =============================================
# 15. RESPONSIVE
# =============================================
print("\n📱 15. RESPONSIVE", flush=True)
r = get("/")
s = BeautifulSoup(r.text, "html.parser")
vp = s.find("meta", attrs={"name": "viewport"})
ck(vp is not None, "Viewport meta")
if vp:
    c = vp.get("content", "")
    ck("width=device-width" in c, "device-width")
    ck("initial-scale" in c, "initial-scale")
found = sum(1 for b in ["sm:", "md:", "lg:", "xl:"] if b in r.text)
ck(found >= 3, f"Responsive classes ({found}/4)")

# =============================================
# 16. SOURCE CODE
# =============================================
print("\n🔍 16. SOURCE QUALITY", flush=True)
import subprocess
res = subprocess.run(
    ["grep", "-rn", "https://persiantoolbox\\.ir",
     "--include=*.tsx", "--include=*.ts", "app/", "components/", "lib/"],
    capture_output=True, text=True,
    cwd="/home/dev13/my-project/sites/live/persiantoolbox"
)
excl = ["lib/brand.ts", "lib/seo.ts", "lib/seo-tools.ts", "test",
        "mobile-app", "scripts/", "proxy.ts", "api/", "lib/features/availability.ts"]
hardcoded = [l for l in res.stdout.strip().split("\n")
             if l and not any(p in l for p in excl)]
ck(len(hardcoded) == 0, f"No hardcoded URLs", f"{len(hardcoded)} remaining")

# =============================================
# 17. PERFORMANCE
# =============================================
print("\n⚡ 17. PERFORMANCE", flush=True)
for p in ["/", "/pricing", "/salary"]:
    t0 = time.time()
    r = get(p, timeout=12)
    ms = round((time.time() - t0) * 1000)
    kb = round(len(r.content) / 1024, 1)
    ck(ms < 5000, f"{p} < 5s ({ms}ms)")
    ck(kb < 300, f"{p} < 300KB ({kb}KB)")
    ck(r.headers.get("Content-Encoding", "") in ("gzip", "br", "zstd"),
       f"{p} compressed")

# =============================================
# 18. ACCESSIBILITY
# =============================================
print("\n♿ 18. A11Y", flush=True)
r = get("/")
s = BeautifulSoup(r.text, "html.parser")
ck(s.find("a", href="#main-content") is not None, "Skip link")
ck(s.find("main", id="main-content") is not None, "Main landmark")
ck(len(s.find_all("nav", attrs={"aria-label": True})) >= 2, "Nav landmarks ≥ 2")
ck(len(s.find_all("h1")) >= 1, "Has H1")

# =============================================
# 19. PWA
# =============================================
print("\n📲 19. PWA", flush=True)
r = get("/manifest.webmanifest")
ck(r.status_code == 200, "manifest.webmanifest")
try:
    m = r.json()
    ck("name" in m, "Manifest name")
    ck("icons" in m, "Manifest icons")
except:
    ck(False, "Manifest valid JSON")
r = get("/robots.txt")
ck(r.status_code == 200, "robots.txt")
ck("sitemap" in r.text.lower(), "robots.txt sitemap")

# =============================================
# 20. CANONICALS
# =============================================
print("\n🔗 20. CANONICALS", flush=True)
for p in ["/", "/pricing", "/salary", "/topics"]:
    r = get(p, timeout=8)
    s = BeautifulSoup(r.text, "html.parser")
    c = s.find("link", rel="canonical")
    ck(c is not None, f"{p} canonical")
    if c:
        ck("persiantoolbox.ir" in c.get("href", ""), f"{p} canonical domain")

# ========================================
elapsed = round(time.time() - start, 1)
total = P + F + W

print("\n" + "=" * 60, flush=True)
print("📊 FINAL RESULTS", flush=True)
print("=" * 60, flush=True)
print(f"  ✅ Passed:   {P}", flush=True)
print(f"  ❌ Failed:   {F}", flush=True)
print(f"  ⚠️  Warnings: {W}", flush=True)
print(f"  📊 Total:    {total}", flush=True)
print(f"  📈 Score:    {round(P/max(total,1)*100)}%", flush=True)
print(f"  ⏱️  Time:     {elapsed}s", flush=True)

if errs:
    print(f"\n🚨 FAILURES ({len(errs)}):", flush=True)
    for e in errs[:20]:
        print(f"    • {e}", flush=True)

if warns:
    print(f"\n⚠️  WARNINGS ({len(warns)}):", flush=True)
    for w in warns[:10]:
        print(f"    • {w}", flush=True)

print("=" * 60, flush=True)
sys.exit(1 if F > 0 else 0)
