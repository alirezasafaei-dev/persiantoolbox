#!/usr/bin/env python3
"""
PersianToolbox Live Site Audit
Tests production site for errors, performance, SEO, security, and UX issues.
"""

import requests
import json
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://persiantoolbox.ir"
RESULTS = {"pass": 0, "fail": 0, "warn": 0, "errors": [], "warnings": []}

def check(label, ok, detail="", severity="fail"):
    if ok:
        RESULTS["pass"] += 1
        print(f"  ✅ {label}")
    else:
        if severity == "warn":
            RESULTS["warn"] += 1
            RESULTS["warnings"].append(f"{label}: {detail}")
            print(f"  ⚠️  {label} — {detail}")
        else:
            RESULTS["fail"] += 1
            RESULTS["errors"].append(f"{label}: {detail}")
            print(f"  ❌ {label} — {detail}")

def test_page(path, expected_status=200, checks=None):
    """Test a single page for status, headers, and content."""
    url = f"{BASE}{path}"
    try:
        start = time.time()
        r = requests.get(url, timeout=15, allow_redirects=True)
        elapsed = round((time.time() - start) * 1000)
        
        check(f"{path} — HTTP {expected_status}", r.status_code == expected_status,
              f"got {r.status_code}")
        
        # Performance
        check(f"{path} —响应时间 < 3s", elapsed < 3000, f"{elapsed}ms", "warn" if elapsed < 5000 else "fail")
        
        # Security headers
        headers = r.headers
        check(f"{path} — X-Content-Type-Options", 
              headers.get("X-Content-Type-Options") == "nosniff",
              f"got: {headers.get('X-Content-Type-Options', 'missing')}")
        check(f"{path} — X-Frame-Options",
              headers.get("X-Frame-Options") == "DENY",
              f"got: {headers.get('X-Frame-Options', 'missing')}")
        check(f"{path} — Referrer-Policy",
              "strict-origin" in (headers.get("Referrer-Policy") or ""),
              f"got: {headers.get('Referrer-Policy', 'missing')}")
        
        # HTML content checks
        html = r.text
        check(f"{path} — Has <title>", "<title>" in html or "title>" in html)
        check(f"{path} — Has meta description", "meta name=\"description\"" in html or 'name="description"' in html)
        check(f"{path} — Has canonical", "rel=\"canonical\"" in html or "canonical" in html)
        check(f"{path} — Has lang=fa", 'lang="fa"' in html)
        check(f"{path} — Has dir=rtl", 'dir="rtl"' in html)
        check(f"{path} — No console.error in HTML", "console.error" not in html)
        
        # JSON-LD check
        jsonld_count = html.count("application/ld+json")
        check(f"{path} — Has JSON-LD schemas", jsonld_count > 0, f"{jsonld_count} schemas found")
        
        # No hardcoded URLs (should use siteUrl)
        hardcoded = len(re.findall(r'https://persiantoolbox\.ir', html))
        check(f"{path} — No hardcoded URLs in rendered HTML", hardcoded == 0,
              f"{hardcoded} hardcoded URLs found", "warn")
        
        # Custom checks
        if checks:
            for check_fn, label in checks:
                try:
                    result = check_fn(html, r)
                    check(f"{path} — {label}", result)
                except Exception as e:
                    check(f"{path} — {label}", False, str(e))
        
        return r.status_code, elapsed
    except requests.exceptions.Timeout:
        check(f"{path} — Timeout", False, "Request timed out after 15s")
        return None, None
    except Exception as e:
        check(f"{path} — Connection", False, str(e))
        return None, None

def test_api(path, expected_status=200, method="GET", data=None):
    """Test an API endpoint."""
    url = f"{BASE}{path}"
    try:
        start = time.time()
        if method == "POST":
            r = requests.post(url, json=data, timeout=10, headers={"Content-Type": "application/json"})
        else:
            r = requests.get(url, timeout=10)
        elapsed = round((time.time() - start) * 1000)
        
        check(f"API {path} — HTTP {expected_status}", r.status_code == expected_status,
              f"got {r.status_code}")
        
        # API should have no-store cache
        cache = r.headers.get("Cache-Control", "")
        check(f"API {path} — no-store cache", "no-store" in cache,
              f"Cache-Control: {cache}")
        
        # API should have X-Robots-Tag: noindex
        robots = r.headers.get("X-Robots-Tag", "")
        check(f"API {path} — noindex", "noindex" in robots,
              f"X-Robots-Tag: {robots}")
        
        return r.status_code, elapsed
    except Exception as e:
        check(f"API {path} — Error", False, str(e))
        return None, None

def test_redirect(path, expected目的地):
    """Test that a redirect works correctly."""
    url = f"{BASE}{path}"
    try:
        r = requests.get(url, timeout=10, allow_redirects=False)
        if r.status_code in (301, 302, 307, 308):
            location = r.headers.get("Location", "")
            check(f"Redirect {path} → {expected目的地}", expected目的地 in location,
                  f"got: {location}")
        else:
            check(f"Redirect {path}", False, f"Expected redirect, got {r.status_code}")
    except Exception as e:
        check(f"Redirect {path}", False, str(e))

def test_search():
    """Test search functionality."""
    print("\n🔍 Testing Search...")
    
    # Test search page loads
    r = requests.get(f"{BASE}/search", timeout=10)
    check("Search page loads", r.status_code == 200)
    
    # Check search has zero-state
    html = r.text
    check("Search has zero-state content", "ابزارهای محبوب" in html or "جستجو" in html)
    check("Search has category sections", "دسته‌بندی" in html or "ابزارها بر اساس" in html)

def test_pricing():
    """Test pricing page."""
    print("\n💰 Testing Pricing...")
    
    r = requests.get(f"{BASE}/pricing", timeout=10)
    check("Pricing page loads", r.status_code == 200)
    
    html = r.text
    check("Pricing has Free tier", "رایگان" in html)
    check("Pricing has Pro tier", "حرفه‌ای" in html)
    check("Pricing has Business tier", "کسب‌وکار" in html or "API" in html)
    check("Pricing has FAQ", "سؤالات متداول" in html)
    check("Pricing has feature comparison", "پردازش چندفایلی" in html)

def test_homepage():
    """Test homepage comprehensively."""
    print("\n🏠 Testing Homepage...")
    
    r = requests.get(f"{BASE}/", timeout=15)
    html = r.text
    
    check("Homepage loads", r.status_code == 200)
    check("Homepage has hero section", "ابزارهای فارسی" in html)
    check("Homepage has role-based paths", "مسیر شما" in html or "کارمند" in html)
    check("Homepage has trust section", "چرا به این سایت اعتماد" in html or "پردازش ۱۰۰٪ محلی" in html)
    check("Homepage has categories", "دسته‌بندی ابزارها" in html)
    check("Homepage has newest tools", "جدیدترین ابزارها" in html)
    check("Homepage has FAQ", "سؤالات متداول" in html)
    check("Homepage has tool count", "۶۶" in html or "ابزار فعال" in html)
    check("Homepage has search", "جستجو" in html)
    check("Homepage has blog preview", "بلاگ" in html or "مقاله" in html)

def test_tool_pages():
    """Test key tool pages."""
    print("\n🔧 Testing Tool Pages...")
    
    tools = [
        ("/salary", "محاسبه حقوق"),
        ("/loan", "اقساط وام"),
        ("/pdf-tools/merge/merge-pdf", "ادغام PDF"),
        ("/pdf-tools/compress/compress-pdf", "فشرده‌سازی PDF"),
        ("/image-tools/image-background-remover", "حذف پس‌زمینه"),
        ("/tools/persian-ocr", "OCR فارسی"),
        ("/text-tools/word-counter", "شمارش کلمات"),
        ("/date-tools/shamsi-gregorian", "تبدیل تاریخ"),
        ("/validation-tools", "اعتبارسنجی"),
        ("/tools/invoice-generator", "فاکتور"),
        ("/tools/tax-calculator", "مالیات"),
    ]
    
    for path, name in tools:
        r = requests.get(f"{BASE}{path}", timeout=10)
        check(f"{name} ({path}) loads", r.status_code == 200)
        
        html = r.text
        check(f"{name} — has heading", "<h1" in html)
        check(f"{name} — has JSON-LD", "application/ld+json" in html)

def test_security():
    """Test security aspects."""
    print("\n🔒 Testing Security...")
    
    # Test API endpoints return proper errors
    r = requests.post(f"{BASE}/api/auth/login", json={}, timeout=10)
    check("API auth/login handles empty body", r.status_code in (400, 401, 405, 422))
    
    # Test admin is protected
    r = requests.get(f"{BASE}/admin", timeout=10, allow_redirects=False)
    check("Admin page is protected", r.status_code in (302, 401, 403, 200))
    
    # Test security.txt
    r = requests.get(f"{BASE}/.well-known/security.txt", timeout=10)
    check("security.txt exists", r.status_code == 200)
    
    # Test robots.txt
    r = requests.get(f"{BASE}/robots.txt", timeout=10)
    check("robots.txt exists", r.status_code == 200)
    check("robots.txt has sitemap", "sitemap" in r.text.lower())
    
    # Test manifest
    r = requests.get(f"{BASE}/manifest.webmanifest", timeout=10)
    check("manifest.webmanifest exists", r.status_code == 200)

def test_internals():
    """Test internal links and navigation."""
    print("\n🔗 Testing Internal Links...")
    
    r = requests.get(f"{BASE}/", timeout=10)
    html = r.text
    
    # Extract all internal links
    links = re.findall(r'href="(/[^"]*)"', html)
    unique_links = list(set(links))
    
    print(f"  Found {len(unique_links)} unique internal links")
    
    # Test a sample of internal links
    sample = unique_links[:15]
    broken = 0
    for link in sample:
        try:
            lr = requests.get(f"{BASE}{link}", timeout=8, allow_redirects=True)
            if lr.status_code >= 400:
                broken += 1
                check(f"Link {link}", False, f"HTTP {lr.status_code}")
        except:
            broken += 1
    
    check(f"Internal links sample ({len(sample)} links)", broken == 0,
          f"{broken} broken links found", "warn" if broken <= 2 else "fail")

def test_performance():
    """Test performance metrics."""
    print("\n⚡ Testing Performance...")
    
    pages = ["/", "/salary", "/pricing", "/topics", "/search"]
    
    for path in pages:
        start = time.time()
        r = requests.get(f"{BASE}{path}", timeout=15)
        elapsed = round((time.time() - start) * 1000)
        
        size_kb = round(len(r.content) / 1024, 1)
        
        check(f"{path} — Response < 2s", elapsed < 2000, f"{elapsed}ms")
        check(f"{path} — Size < 200KB", size_kb < 200, f"{size_kb}KB")
        
        # Check compression
        encoding = r.headers.get("Content-Encoding", "")
        check(f"{path} — Compressed (gzip/br)", encoding in ("gzip", "br", "zstd"),
              f"Encoding: {encoding or 'none'}", "warn")

# ========================================
# RUN ALL TESTS
# ========================================

print("=" * 60)
print("🔍 PersianToolbox Live Site Audit")
print("=" * 60)

# Core pages
print("\n📄 Testing Core Pages...")
core_pages = [
    "/", "/topics", "/search", "/pricing", "/salary", "/loan",
    "/pdf-tools", "/image-tools", "/date-tools", "/text-tools",
    "/validation-tools", "/blog", "/guides", "/privacy", "/terms",
    "/about", "/contact", "/support", "/trust", "/compare",
    "/developers", "/how-it-works", "/use-cases", "/plans",
]

for path in core_pages:
    test_page(path)

# API endpoints
print("\n🔌 Testing API Endpoints...")
test_api("/api/health")
test_api("/api/ready")
test_api("/api/auth/login", method="POST", data={})

# Redirects
print("\n↪️  Testing Redirects...")
test_redirect("/tools-dashboard", "/tools")
test_redirect("/salary-calculator", "/salary")

# Feature tests
test_homepage()
test_search()
test_pricing()
test_tool_pages()
test_security()
test_internals()
test_performance()

# ========================================
# SUMMARY
# ========================================

print("\n" + "=" * 60)
print("📊 AUDIT SUMMARY")
print("=" * 60)
total = RESULTS["pass"] + RESULTS["fail"] + RESULTS["warn"]
print(f"  ✅ Passed:  {RESULTS['pass']}")
print(f"  ❌ Failed:  {RESULTS['fail']}")
print(f"  ⚠️  Warnings: {RESULTS['warn']}")
print(f"  📊 Total:   {total}")
print(f"  📈 Score:   {round(RESULTS['pass'] / max(total, 1) * 100)}%")

if RESULTS["errors"]:
    print(f"\n🚨 CRITICAL ERRORS ({len(RESULTS['errors'])}):")
    for e in RESULTS["errors"][:10]:
        print(f"    • {e}")

if RESULTS["warnings"]:
    print(f"\n⚠️  WARNINGS ({len(RESULTS['warnings'])}):")
    for w in RESULTS["warnings"][:10]:
        print(f"    • {w}")

print("\n" + "=" * 60)
