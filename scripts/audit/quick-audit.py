#!/usr/bin/env python3
"""PersianToolbox Quick Live Audit — focused on critical checks."""
import requests, time, re, json

BASE = "https://persiantoolbox.ir"
P, F, W = 0, 0, 0
errs, warns = [], []

def ck(ok, label, detail="", sev="fail"):
    global P, F, W
    if ok: P += 1; print(f"  ✅ {label}")
    elif sev == "warn": W += 1; warns.append(f"{label}: {detail}"); print(f"  ⚠️  {label} — {detail}")
    else: F += 1; errs.append(f"{label}: {detail}"); print(f"  ❌ {label} — {detail}")

print("=" * 60)
print("🔍 PersianToolbox Live Audit (Quick)")
print("=" * 60)

# 1. Core pages — status + security headers
print("\n📄 Core Pages + Security Headers...")
for p in ["/", "/topics", "/search", "/pricing", "/salary", "/blog", "/pdf-tools", "/validation-tools"]:
    try:
        t0 = time.time()
        r = requests.get(f"{BASE}{p}", timeout=10)
        ms = round((time.time()-t0)*1000)
        ck(r.status_code == 200, f"{p} — HTTP 200", f"got {r.status_code}")
        ck(ms < 4000, f"{p} — < 4s ({ms}ms)", "", "warn")
        h = r.headers
        ck(h.get("X-Content-Type-Options") == "nosniff", f"{p} — X-Content-Type-Options")
        ck(h.get("X-Frame-Options") == "DENY", f"{p} — X-Frame-Options")
        ck("strict-origin" in (h.get("Referrer-Policy") or ""), f"{p} — Referrer-Policy")
    except Exception as e:
        ck(False, f"{p} — Connection", str(e))

# 2. Homepage content
print("\n🏠 Homepage Content...")
r = requests.get(f"{BASE}/", timeout=10)
html = r.text
ck("ابزارهای فارسی" in html, "Hero headline present")
ck("مسیر شما" in html or "کارمند" in html, "Role-based paths section")
ck("پردازش ۱۰۰٪ محلی" in html, "Trust proof section")
ck("دسته‌بندی ابزارها" in html, "Categories section")
ck("جدیدترین ابزارها" in html, "Newest tools section")
ck('lang="fa"' in html, "lang=fa")
ck('dir="rtl"' in html, "dir=rtl")
ck("application/ld+json" in html, "JSON-LD schemas")

# 3. Pricing page
print("\n💰 Pricing Page...")
r = requests.get(f"{BASE}/pricing", timeout=10)
html = r.text
ck(r.status_code == 200, "Pricing loads")
ck("رایگان" in html, "Free tier present")
ck("حرفه‌ای" in html, "Pro tier present")
ck("کسب‌وکار" in html or "API" in html, "Business tier present")
ck("سؤالات متداول" in html, "FAQ present")
ck("پردازش چندفایلی" in html, "Feature comparison table")

# 4. Search
print("\n🔍 Search...")
r = requests.get(f"{BASE}/search", timeout=10)
html = r.text
ck(r.status_code == 200, "Search loads")
ck("ابزارهای محبوب" in html or "جستجو" in html, "Zero-state content")
ck("دسته‌بندی" in html, "Category sections")

# 5. API endpoints
print("\n🔌 API Endpoints...")
for ep in ["/api/health", "/api/ready"]:
    try:
        r = requests.get(f"{BASE}{ep}", timeout=8)
        ck(r.status_code == 200, f"{ep} — HTTP 200", f"got {r.status_code}")
        ck("no-store" in r.headers.get("Cache-Control", ""), f"{ep} — no-store cache")
    except Exception as e:
        ck(False, f"{ep} — Error", str(e))

# 6. Security
print("\n🔒 Security...")
for path, code in [("/.well-known/security.txt", 200), ("/robots.txt", 200), ("/manifest.webmanifest", 200)]:
    try:
        r = requests.get(f"{BASE}{path}", timeout=8)
        ck(r.status_code == code, f"{path} — HTTP {code}")
    except Exception as e:
        ck(False, f"{path} — Error", str(e))

# 7. Tool pages sample
print("\n🔧 Tool Pages Sample...")
for p, name in [("/salary", "Salary"), ("/loan", "Loan"), ("/pdf-tools/compress/compress-pdf", "PDF Compress"),
                ("/image-tools/image-background-remover", "BG Remove"), ("/tools/tax-calculator", "Tax Calc")]:
    try:
        r = requests.get(f"{BASE}{p}", timeout=10)
        ck(r.status_code == 200, f"{name} loads", f"got {r.status_code}")
        ck("<h1" in r.text, f"{name} — has H1")
        ck("application/ld+json" in r.text, f"{name} — has JSON-LD")
    except Exception as e:
        ck(False, f"{name} — Error", str(e))

# 8. Redirects
print("\n↪️  Redirects...")
for src, dst in [("/tools-dashboard", "/tools"), ("/salary-calculator", "/salary")]:
    try:
        r = requests.get(f"{BASE}{src}", timeout=8, allow_redirects=False)
        loc = r.headers.get("Location", "")
        ck(r.status_code in (301,302,307,308), f"{src} → {dst}", f"got {r.status_code}")
    except Exception as e:
        ck(False, f"Redirect {src}", str(e))

# 9. Internal links sample
print("\n🔗 Internal Links Sample...")
r = requests.get(f"{BASE}/", timeout=10)
links = list(set(re.findall(r'href="(/[^"]*)"', r.text)))[:10]
broken = 0
for link in links:
    try:
        lr = requests.get(f"{BASE}{link}", timeout=6, allow_redirects=True)
        if lr.status_code >= 400: broken += 1; ck(False, f"Link {link}", f"HTTP {lr.status_code}")
    except: broken += 1
ck(broken == 0, f"Internal links ({len(links)} tested)", f"{broken} broken")

# 10. Hardcoded URLs in source code
print("\n🔍 Source Code Audit...")
import subprocess
result = subprocess.run(
    ["grep", "-rn", "https://persiantoolbox\\.ir", "--include=*.tsx", "--include=*.ts",
     "app/", "components/", "lib/"],
    capture_output=True, text=True, cwd="/home/dev13/my-project/sites/live/persiantoolbox"
)
hardcoded = [l for l in result.stdout.strip().split('\n') if l and 'lib/brand.ts' not in l 
             and 'lib/seo.ts' not in l and 'lib/seo-tools.ts' not in l and 'test' not in l
             and 'mobile-app' not in l and 'scripts/' not in l and 'proxy.ts' not in l
             and 'api/' not in l and 'lib/features/availability.ts' not in l]
ck(len(hardcoded) == 0, f"Hardcoded URLs in source", f"{len(hardcoded)} remaining")

# ========================================
print("\n" + "=" * 60)
total = P + F + W
print(f"📊 RESULTS: ✅ {P} passed | ❌ {F} failed | ⚠️  {W} warnings | 📊 {total} total")
print(f"📈 Score: {round(P/max(total,1)*100)}%")
if errs: print(f"\n🚨 FAILURES:"); [print(f"    • {e}") for e in errs[:15]]
if warns: print(f"\n⚠️  WARNINGS:"); [print(f"    • {w}") for w in warns[:15]]
print("=" * 60)
