#!/usr/bin/env python3
"""
Comprehensive Live Site Tests — PersianToolbox
Tests every aspect: links, SEO, security, performance, content, a11y, forms.
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
        P += 1; print(f"  ✅ {label}")
    elif sev == "warn":
        W += 1; warns.append(f"{label}: {detail}"); print(f"  ⚠️  {label} — {detail}")
    else:
        F += 1; errs.append(f"{label}: {detail}"); print(f"  ❌ {label} — {detail}")

def get(path, timeout=12):
    return requests.get(f"{BASE}{path}", timeout=timeout, allow_redirects=True)

# =============================================
# 1. ALL ROUTES HTTP STATUS
# =============================================
def test_all_routes():
    print("\n📄 1. ALL ROUTES — HTTP STATUS")
    routes = [
        "/", "/topics", "/search", "/pricing", "/salary", "/loan",
        "/pdf-tools", "/image-tools", "/date-tools", "/text-tools",
        "/validation-tools", "/blog", "/guides", "/privacy", "/terms",
        "/about", "/contact", "/support", "/trust", "/compare",
        "/developers", "/how-it-works", "/use-cases", "/plans",
        "/market", "/market/currency-rates", "/market/gold-prices",
        "/text-tools/word-counter", "/text-tools/number-converter",
        "/text-tools/case-converter", "/text-tools/remove-spaces",
        "/text-tools/extract-info", "/text-tools/address-fa-to-en",
        "/date-tools/shamsi-gregorian", "/date-tools/date-difference",
        "/date-tools/persian-calendar", "/date-tools/event-reminder",
        "/image-tools/image-format-converter", "/image-tools/resize-image",
        "/image-tools/rotate-image", "/image-tools/text-on-image",
        "/image-tools/image-background-remover",
        "/pdf-tools/merge/merge-pdf", "/pdf-tools/split/split-pdf",
        "/pdf-tools/compress/compress-pdf", "/pdf-tools/convert/pdf-to-word",
        "/pdf-tools/convert/word-to-pdf", "/pdf-tools/convert/pdf-to-text",
        "/pdf-tools/convert/pdf-to-image", "/pdf-tools/convert/image-to-pdf",
        "/pdf-tools/security/encrypt-pdf", "/pdf-tools/security/decrypt-pdf",
        "/pdf-tools/watermark/add-watermark", "/pdf-tools/edit/rotate-pages",
        "/pdf-tools/edit/reorder-pages", "/pdf-tools/edit/delete-pages",
        "/pdf-tools/extract/extract-text", "/pdf-tools/extract/extract-pages",
        "/tools/invoice-generator", "/tools/report-generator",
        "/tools/tax-calculator", "/tools/vat-calculator",
        "/tools/mahr-calculator", "/tools/check-penalty",
        "/tools/hiring-cost", "/tools/bonus-calculator",
        "/tools/insurance-calculator", "/tools/profit-margin",
        "/tools/real-purchasing-power", "/tools/retirement-calculator",
        "/tools/rent-vs-buy", "/tools/overtime-calculator",
        "/tools/leave-calculator", "/tools/loan-vs-investment",
        "/tools/investment-calculator", "/tools/bank-rate-comparator",
        "/tools/inflation-calculator", "/tools/currency-converter",
        "/tools/persian-ocr", "/tools/legal-document-generator",
        "/tools/base64-tool", "/tools/hash-generator",
        "/tools/json-formatter", "/tools/severance-calculator",
        "/validation-tools/image-to-qr", "/validation-tools/persian-password",
        "/interest", "/asdev", "/ads", "/refer",
        "/brand", "/compatibility", "/services",
        "/subscription-roadmap", "/deployment-roadmap", "/roadmap-board",
        "/history", "/favorites", "/offline",
    ]
    
    ok_count = 0
    fail_count = 0
    for r in routes:
        try:
            resp = get(r, timeout=10)
            if resp.status_code == 200:
                ok_count += 1
            else:
                fail_count += 1
                ck(False, f"{r}", f"HTTP {resp.status_code}")
        except Exception as e:
            fail_count += 1
            ck(False, f"{r}", str(e)[:50])
    
    ck(fail_count == 0, f"All {len(routes)} routes return HTTP 200",
       f"{fail_count} failed out of {len(routes)}")

# =============================================
# 2. SECURITY HEADERS (ALL ROUTES)
# =============================================
def test_security_headers():
    print("\n🔒 2. SECURITY HEADERS")
    routes = ["/", "/pricing", "/salary", "/blog", "/pdf-tools"]
    for r in routes:
        try:
            h = get(r, timeout=10).headers
            ck(h.get("X-Content-Type-Options") == "nosniff", f"{r} X-Content-Type-Options")
            ck(h.get("X-Frame-Options") == "DENY", f"{r} X-Frame-Options")
            ck("strict-origin" in (h.get("Referrer-Policy") or ""), f"{r} Referrer-Policy")
            ck("max-age" in (h.get("Strict-Transport-Security") or ""), f"{r} HSTS")
        except Exception as e:
            ck(False, f"{r} headers", str(e)[:50])

# =============================================
# 3. CSS & STATIC ASSETS
# =============================================
def test_static_assets():
    print("\n🎨 3. CSS & STATIC ASSETS")
    r = get("/")
    soup = BeautifulSoup(r.text, "html.parser")
    
    css_tags = soup.find_all("link", rel="stylesheet")
    ck(len(css_tags) > 0, f"HTML has {len(css_tags)} stylesheet links")
    
    for tag in css_tags[:3]:
        href = tag.get("href", "")
        if href.startswith("/"):
            css_r = get(href, timeout=10)
            ck(css_r.status_code == 200, f"CSS {href[:40]} served (200)")
    
    fonts = ["/fonts/Vazirmatn-Bold.woff2", "/fonts/Vazirmatn-Regular.woff2"]
    for f_path in fonts:
        fr = get(f_path, timeout=10)
        ck(fr.status_code == 200, f"Font {f_path.split('/')[-1]} (200)")
        ck(len(fr.content) > 10000, f"Font {f_path.split('/')[-1]} has content ({len(fr.content)} bytes)")
    
    # Check JS files
    js_tags = soup.find_all("script", src=True)
    js_count = len([t for t in js_tags if "/_next/" in t.get("src", "")])
    ck(js_count > 5, f"HTML has {js_count} Next.js script tags")

# =============================================
# 4. SEO — ALL PAGES
# =============================================
def test_seo():
    print("\n🔍 4. SEO — STRUCTURED DATA & META")
    pages = ["/", "/pricing", "/salary", "/topics", "/search",
             "/blog", "/privacy", "/terms", "/about", "/pdf-tools",
             "/tools/invoice-generator", "/tools/tax-calculator"]
    
    for p in pages:
        try:
            r = get(p, timeout=10)
            soup = BeautifulSoup(r.text, "html.parser")
            
            # Title
            title = soup.find("title")
            ck(title is not None and len(title.text.strip()) > 0, f"{p} — <title>")
            
            # Meta description
            meta_desc = soup.find("meta", attrs={"name": "description"})
            ck(meta_desc is not None, f"{p} — meta description")
            
            # Canonical
            canonical = soup.find("link", rel="canonical")
            ck(canonical is not None, f"{p} — canonical link")
            
            # JSON-LD
            jsonld = soup.find_all("script", type="application/ld+json")
            ck(len(jsonld) > 0, f"{p} — JSON-LD ({len(jsonld)} schemas)")
            
            # lang=fa
            html_tag = soup.find("html")
            ck(html_tag and html_tag.get("lang") == "fa", f"{p} — lang=fa")
            
            # dir=rtl
            ck(html_tag and html_tag.get("dir") == "rtl", f"{p} — dir=rtl")
            
            # H1
            h1 = soup.find("h1")
            ck(h1 is not None, f"{p} — has <h1>")
            
        except Exception as e:
            ck(False, f"{p} SEO", str(e)[:50])

# =============================================
# 5. HOMEPAGE CONTENT
# =============================================
def test_homepage():
    print("\n🏠 5. HOMEPAGE CONTENT")
    r = get("/")
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text()
    
    ck("ابزارهای فارسی" in text, "Hero headline")
    ck("مسیر شما" in text or "کارمند" in text, "Role-based paths section")
    ck("پردازش ۱۰۰٪ محلی" in text, "Trust proof — local processing")
    ck("بدون نیاز به ثبت‌نام" in text, "Trust proof — no signup")
    ck("شفافیت کامل" in text, "Trust proof — transparency")
    ck("دسته‌بندی ابزارها" in text, "Categories section")
    ck("جدیدترین ابزارها" in text, "Newest tools section")
    ck("ابزارهای پرتقاضا" in text, "Popular tools section")
    ck("سؤالات متداول" in text, "FAQ section")
    ck("بلاگ" in text, "Blog section")
    
    # Check navigation links
    nav_links = [a.get("href") for a in soup.find_all("a", href=True)]
    ck("/topics" in nav_links, "Nav has /topics link")
    ck("/search" in nav_links or any("/search" in l for l in nav_links), "Nav has search")
    ck("/pricing" in nav_links or any("/pricing" in l for l in nav_links), "Footer has /pricing")

# =============================================
# 6. PRICING PAGE
# =============================================
def test_pricing():
    print("\n💰 6. PRICING PAGE")
    r = get("/pricing")
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text()
    
    ck(r.status_code == 200, "Pricing loads (200)")
    ck("رایگان" in text, "Free tier")
    ck("حرفه‌ای" in text, "Pro tier")
    ck("کسب‌وکار" in text or "API" in text, "Business tier")
    ck("سؤالات متداول" in text, "FAQ section")
    ck("پردازش چندفایلی" in text, "Feature: batch processing")
    ck("OCR پیشرفته" in text, "Feature: advanced OCR")
    ck("بدون تبلیغات" in text, "Feature: ad-free")
    ck(" API " in text or "API" in text, "Feature: API access")

# =============================================
# 7. SEARCH PAGE
# =============================================
def test_search():
    print("\n🔍 7. SEARCH PAGE")
    r = get("/search")
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text()
    
    ck(r.status_code == 200, "Search loads (200)")
    ck("جستجوی ابزارها" in text, "Search heading")
    ck("ابزارهای محبوب" in text, "Popular tools zero-state")
    ck("ابزارها بر اساس دسته‌بندی" in text or "دسته‌بندی" in text, "Category sections")
    
    # Check search input exists
    search_input = soup.find("input", {"aria-label": "جستجوی ابزارها"})
    ck(search_input is not None, "Search input with aria-label")

# =============================================
# 8. TOOL PAGES — STRUCTURE
# =============================================
def test_tool_pages():
    print("\n🔧 8. TOOL PAGES — STRUCTURE")
    tools = [
        ("/salary", "محاسبه حقوق"),
        ("/loan", "اقساط وام"),
        ("/pdf-tools/compress/compress-pdf", "فشرده‌سازی PDF"),
        ("/image-tools/image-background-remover", "حذف پس‌زمینه"),
        ("/tools/persian-ocr", "OCR فارسی"),
        ("/tools/invoice-generator", "فاکتور"),
        ("/tools/tax-calculator", "مالیات"),
        ("/tools/mahr-calculator", "مهریه"),
        ("/validation-tools/image-to-qr", "QR Code"),
        ("/text-tools/word-counter", "شمارش کلمات"),
        ("/date-tools/shamsi-gregorian", "تبدیل تاریخ"),
    ]
    
    for path, name in tools:
        try:
            r = get(path, timeout=10)
            soup = BeautifulSoup(r.text, "html.parser")
            
            ck(r.status_code == 200, f"{name} ({path}) loads")
            ck(soup.find("h1") is not None, f"{name} — has H1")
            ck(len(soup.find_all("script", type="application/ld+json")) > 0, f"{name} — has JSON-LD")
            
            # Check breadcrumb exists (in ToolPageShell)
            navs = soup.find_all("nav", attrs={"aria-label": "مسیر ناوبری"})
            ck(len(navs) > 0, f"{name} — has breadcrumb nav")
            
        except Exception as e:
            ck(False, f"{name}", str(e)[:50])

# =============================================
# 9. INTERNAL LINKS (FULL CRAWL)
# =============================================
def test_internal_links():
    print("\n🔗 9. INTERNAL LINKS — FULL CRAWL")
    r = get("/")
    soup = BeautifulSoup(r.text, "html.parser")
    
    all_links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/") and not href.startswith("//") and "#" not in href:
            all_links.add(href.split("?")[0])
    
    print(f"  Found {len(all_links)} unique internal links on homepage")
    
    broken = []
    def check_link(link):
        try:
            lr = get(link, timeout=8)
            return link, lr.status_code
        except:
            return link, -1
    
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {ex.submit(check_link, l): l for l in all_links}
        for f in as_completed(futures):
            link, status = f.result()
            if status >= 400 or status == -1:
                broken.append((link, status))
    
    ck(len(broken) == 0, f"All {len(all_links)} homepage links valid",
       f"{len(broken)} broken: {broken[:5]}")

# =============================================
# 10. API ENDPOINTS
# =============================================
def test_api():
    print("\n🔌 10. API ENDPOINTS")
    endpoints = [
        ("/api/health", "GET", 200),
        ("/api/ready", "GET", 200),
    ]
    for path, method, expected in endpoints:
        try:
            r = get(path, timeout=8)
            ck(r.status_code == expected, f"{path} — HTTP {expected}")
            ck("no-store" in r.headers.get("Cache-Control", ""), f"{path} — no-store cache")
            ck("noindex" in r.headers.get("X-Robots-Tag", ""), f"{path} — noindex")
            
            if path == "/api/health":
                data = r.json()
                ck(data.get("status") == "ok", f"{path} — status=ok")
                ck("version" in data, f"{path} — has version")
                ck("node" in data, f"{path} — has node version")
        except Exception as e:
            ck(False, f"{path}", str(e)[:50])

# =============================================
# 11. REDIRECTS
# =============================================
def test_redirects():
    print("\n↪️  11. REDIRECTS")
    redirects = [
        ("/tools-dashboard", "/tools"),
        ("/salary-calculator", "/salary"),
        ("/loan-calculator", "/loan"),
        ("/image-compress", "/image-tools"),
    ]
    for src, expected_dst in redirects:
        try:
            r = requests.get(f"{BASE}{src}", timeout=8, allow_redirects=False)
            ck(r.status_code in (301, 302, 307, 308), f"{src} redirects",
               f"got {r.status_code}")
            loc = r.headers.get("Location", "")
            ck(expected_dst in loc, f"{src} → {expected_dst}", f"got: {loc}")
        except Exception as e:
            ck(False, f"Redirect {src}", str(e)[:50])

# =============================================
# 12. FORMS & INTERACTIVE ELEMENTS
# =============================================
def test_forms():
    print("\n📝 12. FORMS & INTERACTIVE ELEMENTS")
    
    # Search form
    r = get("/search")
    soup = BeautifulSoup(r.text, "html.parser")
    search_input = soup.find("input", {"aria-label": "جستجوی ابزارها"})
    ck(search_input is not None, "Search form — input with aria-label")
    ck(search_input.get("type") == "text" if search_input else False, "Search — type=text")
    
    # Salary page form
    r = get("/salary")
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text()
    ck("محاسبه حقوق" in text or "حقوق" in text, "Salary — form heading present")
    
    # Pricing page cards
    r = get("/pricing")
    soup = BeautifulSoup(r.text, "html.parser")
    cards = soup.find_all("div", class_=lambda c: c and "rounded" in c)
    ck(len(cards) >= 3, f"Pricing — {len(cards)} plan cards found")

# =============================================
# 13. BLOG
# =============================================
def test_blog():
    print("\n📰 13. BLOG")
    r = get("/blog")
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text()
    
    ck(r.status_code == 200, "Blog loads (200)")
    ck("بلاگ" in text or "مقالات" in text, "Blog heading")
    
    # Check blog has article links
    article_links = [a for a in soup.find_all("a", href=True) if "/blog/" in a.get("href", "")]
    ck(len(article_links) > 0, f"Blog has {len(article_links)} article links")

# =============================================
# 14. PRIVACY & TRUST
# =============================================
def test_trust():
    print("\n🛡️  14. PRIVACY & TRUST")
    for path, keywords in [
        ("/privacy", ["حریم خصوصی", "پردازش محلی"]),
        ("/trust", ["شفافیت", "فنی"]),
        ("/terms", ["قوانین", "مقررات"]),
    ]:
        try:
            r = get(path, timeout=10)
            soup = BeautifulSoup(r.text, "html.parser")
            text = soup.get_text()
            ck(r.status_code == 200, f"{path} loads (200)")
            for kw in keywords:
                ck(kw in text, f"{path} — has '{kw}'")
        except Exception as e:
            ck(False, f"{path}", str(e)[:50])

# =============================================
# 15. RESPONSIVE (VIEWPORT META)
# =============================================
def test_responsive():
    print("\n📱 15. RESPONSIVE DESIGN")
    r = get("/")
    soup = BeautifulSoup(r.text, "html.parser")
    
    viewport = soup.find("meta", attrs={"name": "viewport"})
    ck(viewport is not None, "Viewport meta tag present")
    if viewport:
        content = viewport.get("content", "")
        ck("width=device-width" in content, "Viewport has device-width")
        ck("initial-scale" in content, "Viewport has initial-scale")
    
    # Check CSS uses responsive classes
    html = r.text
    responsive_classes = ["sm:", "md:", "lg:", "xl:"]
    found = sum(1 for c in responsive_classes if c in html)
    ck(found >= 3, f"Responsive CSS classes found ({found}/4 breakpoints)")

# =============================================
# 16. HARDCODED URL CHECK
# =============================================
def test_source_quality():
    print("\n🔍 16. SOURCE CODE QUALITY")
    import subprocess
    
    result = subprocess.run(
        ["grep", "-rn", "https://persiantoolbox\\.ir",
         "--include=*.tsx", "--include=*.ts",
         "app/", "components/", "lib/"],
        capture_output=True, text=True,
        cwd="/home/dev13/my-project/sites/live/persiantoolbox"
    )
    
    exclude = ["lib/brand.ts", "lib/seo.ts", "lib/seo-tools.ts",
               "test", "mobile-app", "scripts/", "proxy.ts",
               "api/", "lib/features/availability.ts"]
    
    hardcoded = [l for l in result.stdout.strip().split("\n")
                 if l and not any(p in l for p in exclude)]
    ck(len(hardcoded) == 0, f"No hardcoded URLs in source",
       f"{len(hardcoded)} found", "warn" if hardcoded else "pass")

# =============================================
# 17. PERFORMANCE
# =============================================
def test_performance():
    print("\n⚡ 17. PERFORMANCE")
    pages = ["/", "/pricing", "/salary", "/search", "/topics"]
    
    for p in pages:
        try:
            t0 = time.time()
            r = get(p, timeout=15)
            ms = round((time.time() - t0) * 1000)
            size_kb = round(len(r.content) / 1024, 1)
            
            ck(ms < 5000, f"{p} — Response < 5s ({ms}ms)")
            ck(size_kb < 300, f"{p} — Size < 300KB ({size_kb}KB)")
            
            encoding = r.headers.get("Content-Encoding", "")
            ck(encoding in ("gzip", "br", "zstd"), f"{p} — Compressed ({encoding or 'none'})")
        except Exception as e:
            ck(False, f"{p} perf", str(e)[:50])

# =============================================
# 18. ACCESSIBILITY BASICS
# =============================================
def test_accessibility():
    print("\n♿ 18. ACCESSIBILITY BASICS")
    r = get("/")
    soup = BeautifulSoup(r.text, "html.parser")
    
    # Skip link
    skip = soup.find("a", href="#main-content")
    ck(skip is not None, "Skip link to #main-content")
    
    # Main landmark
    main = soup.find("main", id="main-content")
    ck(main is not None, "Main landmark with id=main-content")
    
    # Nav landmark
    navs = soup.find_all("nav", attrs={"aria-label": True})
    ck(len(navs) >= 2, f"Nav landmarks with aria-label ({len(navs)} found)")
    
    # Heading hierarchy
    headings = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
    h1_count = len(soup.find_all("h1"))
    ck(h1_count >= 1, f"Has at least one H1 ({h1_count} found)")
    
    # Images with alt text
    images = soup.find_all("img")
    no_alt = [img for img in images if not img.get("alt") and not img.get("aria-hidden")]
    ck(len(no_alt) == 0, f"All images have alt text",
       f"{len(no_alt)} images without alt")

# =============================================
# 19. MANIFEST & PWA
# =============================================
def test_pwa():
    print("\n📲 19. PWA & MANIFEST")
    r = get("/manifest.webmanifest")
    ck(r.status_code == 200, "manifest.webmanifest (200)")
    
    try:
        manifest = r.json()
        ck("name" in manifest, "Manifest has name")
        ck("icons" in manifest, "Manifest has icons")
        ck(manifest.get("start_url") or manifest.get("start_url") == "/", "Manifest has start_url")
    except:
        ck(False, "Manifest is valid JSON")
    
    # robots.txt
    r = get("/robots.txt")
    ck(r.status_code == 200, "robots.txt (200)")
    ck("sitemap" in r.text.lower(), "robots.txt has sitemap")

# =============================================
# 20. CANONICAL URLs
# =============================================
def test_canonicals():
    print("\n🔗 20. CANONICAL URLS")
    pages = ["/", "/pricing", "/salary", "/topics"]
    for p in pages:
        try:
            r = get(p, timeout=10)
            soup = BeautifulSoup(r.text, "html.parser")
            canonical = soup.find("link", rel="canonical")
            ck(canonical is not None, f"{p} — canonical present")
            if canonical:
                href = canonical.get("href", "")
                ck("persiantoolbox.ir" in href, f"{p} — canonical domain correct")
                ck(not href.endswith("//"), f"{p} — canonical not double-slashed")
        except Exception as e:
            ck(False, f"{p} canonical", str(e)[:50])

# ========================================
# RUN ALL
# ========================================
print("=" * 60)
print("🔍 PersianToolbox Comprehensive Live Tests")
print(f"   Target: {BASE}")
print(f"   Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 60)

start = time.time()

test_all_routes()
test_security_headers()
test_static_assets()
test_seo()
test_homepage()
test_pricing()
test_search()
test_tool_pages()
test_internal_links()
test_api()
test_redirects()
test_forms()
test_blog()
test_trust()
test_responsive()
test_source_quality()
test_performance()
test_accessibility()
test_pwa()
test_canonicals()

elapsed = round(time.time() - start, 1)
total = P + F + W

print("\n" + "=" * 60)
print("📊 FINAL RESULTS")
print("=" * 60)
print(f"  ✅ Passed:   {P}")
print(f"  ❌ Failed:   {F}")
print(f"  ⚠️  Warnings: {W}")
print(f"  📊 Total:    {total}")
print(f"  📈 Score:    {round(P/max(total,1)*100)}%")
print(f"  ⏱️  Time:     {elapsed}s")

if errs:
    print(f"\n🚨 FAILURES ({len(errs)}):")
    for e in errs[:20]:
        print(f"    • {e}")

if warns:
    print(f"\n⚠️  WARNINGS ({len(warns)}):")
    for w in warns[:10]:
        print(f"    • {w}")

print("=" * 60)
sys.exit(1 if F > 0 else 0)
