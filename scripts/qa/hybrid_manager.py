#!/usr/bin/env python3
"""
PersianToolbox Hybrid QA Manager
Combines TypeScript Playwright tests with Python-based crawling and validation.
Uses uv for Python dependency management.
"""
import os
import sys
import json
import time
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============================================
# CONFIG
# ============================================
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BASE_URL = os.environ.get("QA_BASE_URL", "https://persiantoolbox.ir")
LOCAL_URL = os.environ.get("QA_LOCAL_URL", "http://localhost:3100")
USE_LOCAL = os.environ.get("QA_LOCAL", "0") == "1"
TARGET = LOCAL_URL if USE_LOCAL else BASE_URL
TIMEOUT = 15
RESULTS = {"pass": 0, "fail": 0, "warn": 0, "errors": [], "warnings": []}


def check(ok, label, detail="", severity="fail"):
    if ok:
        RESULTS["pass"] += 1
        print(f"  ✅ {label}")
    elif severity == "warn":
        RESULTS["warn"] += 1
        RESULTS["warnings"].append(f"{label}: {detail}")
        print(f"  ⚠️  {label} — {detail}")
    else:
        RESULTS["fail"] += 1
        RESULTS["errors"].append(f"{label}: {detail}")
        print(f"  ❌ {label} — {detail}")


# ============================================
# STEP 1: ROUTE DISCOVERY FROM CODEBASE
# ============================================
def discover_routes():
    """Read actual routes from app/ directory."""
    app_dir = PROJECT_ROOT / "app"
    routes = []
    for page_file in app_dir.rglob("page.tsx"):
        rel = page_file.relative_to(app_dir)
        parts = list(rel.parts)
        if parts[-1] == "page.tsx":
            parts = parts[:-1]
        route = "/" + "/".join(parts)
        if route == "/.":
            route = "/"
        # Skip dynamic routes with parameters
        if "[" in route:
            continue
        routes.append(route)
    return sorted(set(routes))


# ============================================
# STEP 2: BROKEN LINK CRAWLER
# ============================================
def crawl_links(routes):
    """Crawl routes and check internal links (optimized: sample 20 routes)."""
    import requests
    from bs4 import BeautifulSoup

    sample = routes[:20]  # Sample first 20 routes for speed
    print(f"\n🔗 Crawling {len(sample)} routes (sample of {len(routes)}) for broken links...")
    all_links = set()
    broken = []

    def check_page(route):
        try:
            url = f"{TARGET}{route}"
            r = requests.get(url, timeout=TIMEOUT, allow_redirects=True)
            if r.status_code >= 400:
                return route, None, f"HTTP {r.status_code}"

            soup = BeautifulSoup(r.text, "html.parser")
            links = set()
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if href.startswith("/") and not href.startswith("//"):
                    links.add(href.split("#")[0].split("?")[0])
            return route, links, None
        except Exception as e:
            return route, None, str(e)

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(check_page, r): r for r in sample}
        for future in as_completed(futures):
            route, links, error = future.result()
            if error:
                broken.append((route, error))
            elif links:
                all_links.update(links)

    # Check a sample of discovered links
    link_sample = list(all_links)[:30]
    print(f"  Found {len(all_links)} unique internal links, checking {len(link_sample)}...")
    link_errors = []

    def check_link(link):
        try:
            url = f"{TARGET}{link}"
            r = requests.get(url, timeout=8, allow_redirects=True)
            return link, r.status_code
        except Exception as e:
            return link, str(e)

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_link, l): l for l in link_sample}
        for future in as_completed(futures):
            link, status = future.result()
            if isinstance(status, int) and status >= 400:
                link_errors.append((link, status))

    check(len(broken) == 0, f"All {len(sample)} sampled routes return HTTP 200",
          f"{len(broken)} broken: {broken[:3]}")
    check(len(link_errors) == 0, f"All {len(link_sample)} sampled links valid",
          f"{len(link_errors)} broken: {link_errors[:5]}", "warn")

    return all_links, broken, link_errors


# ============================================
# STEP 3: SECURITY HEADERS CHECK
# ============================================
def check_security():
    """Verify security headers on all routes."""
    import requests

    print("\n🔒 Checking security headers...")
    routes = discover_routes()[:10]  # Sample 10 routes
    required_headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
    }

    for route in routes:
        try:
            r = requests.get(f"{TARGET}{route}", timeout=TIMEOUT)
            for header, expected in required_headers.items():
                actual = r.headers.get(header, "")
                check(actual == expected, f"{route} — {header}",
                      f"got: {actual or 'missing'}")
        except Exception as e:
            check(False, f"{route} — Connection", str(e))


# ============================================
# STEP 4: CSS/STATIC ASSETS VERIFICATION
# ============================================
def check_static_assets():
    """Verify CSS, JS, and font files are served."""
    import requests

    print("\n🎨 Checking static assets...")
    r = requests.get(f"{TARGET}/", timeout=TIMEOUT)
    html = r.text

    # Extract CSS files
    import re
    css_files = re.findall(r'href="/_next/static/chunks/[^"]*\.css"', html)
    check(len(css_files) > 0, "HTML references CSS files", f"{len(css_files)} found")

    for css_match in css_files[:3]:
        css_path = css_match.split('"')[1]
        css_r = requests.get(f"{TARGET}{css_path}", timeout=10)
        check(css_r.status_code == 200, f"CSS {css_path} served",
              f"HTTP {css_r.status_code}")

    # Check fonts
    font_r = requests.get(f"{TARGET}/fonts/Vazirmatn-Bold.woff2", timeout=10)
    check(font_r.status_code == 200, "Font Vazirmatn-Bold served",
          f"HTTP {font_r.status_code}")


# ============================================
# STEP 5: SEO STRUCTURED DATA CHECK
# ============================================
def check_seo():
    """Verify JSON-LD schemas on key pages."""
    import requests

    print("\n🔍 Checking SEO structured data...")
    key_routes = ["/", "/pricing", "/salary", "/topics", "/search"]
    for route in key_routes:
        try:
            r = requests.get(f"{TARGET}{route}", timeout=TIMEOUT)
            html = r.text
            jsonld_count = html.count("application/ld+json")
            has_title = "<title>" in html or "title>" in html
            has_meta = 'name="description"' in html
            has_canonical = "canonical" in html
            has_lang = 'lang="fa"' in html

            check(jsonld_count > 0, f"{route} — JSON-LD schemas", f"{jsonld_count} found")
            check(has_title, f"{route} — Has title")
            check(has_meta, f"{route} — Has meta description")
            check(has_canonical, f"{route} — Has canonical")
            check(has_lang, f"{route} — Has lang=fa")
        except Exception as e:
            check(False, f"{route} — Error", str(e))


# ============================================
# STEP 6: API ENDPOINT CHECK
# ============================================
def check_api():
    """Verify API endpoints."""
    import requests

    print("\n🔌 Checking API endpoints...")
    endpoints = [
        ("/api/health", 200),
        ("/api/ready", 200),
    ]
    for path, expected in endpoints:
        try:
            r = requests.get(f"{TARGET}{path}", timeout=10)
            check(r.status_code == expected, f"{path} — HTTP {expected}",
                  f"got {r.status_code}")
            check("no-store" in r.headers.get("Cache-Control", ""),
                  f"{path} — no-store cache")
        except Exception as e:
            check(False, f"{path} — Error", str(e))


# ============================================
# STEP 7: FILE INTEGRITY CHECK
# ============================================
def check_file_integrity():
    """Verify critical config files exist and are valid."""
    print("\n📁 Checking file integrity...")

    critical_files = [
        "package.json",
        "next.config.mjs",
        "tailwind.config.ts",
        "tsconfig.json",
        "playwright.config.ts",
        "vitest.config.ts",
        "lib/tools-registry.ts",
        "lib/navigation.ts",
        "lib/seo.ts",
        "lib/brand.ts",
    ]

    for f in critical_files:
        path = PROJECT_ROOT / f
        check(path.exists(), f"File exists: {f}")

        if path.exists() and f.endswith(".json") and f != "tsconfig.json":
            try:
                json.loads(path.read_text())
                check(True, f"{f} — Valid JSON")
            except json.JSONDecodeError as e:
                check(False, f"{f} — Invalid JSON", str(e))


# ============================================
# STEP 8: HARDCODED URL CHECK
# ============================================
def check_hardcoded_urls():
    """Check for hardcoded URLs that should use siteUrl."""
    print("\n🔗 Checking hardcoded URLs in source...")
    import subprocess

    result = subprocess.run(
        ["grep", "-rn", "https://persiantoolbox\\.ir",
         "--include=*.tsx", "--include=*.ts",
         "app/", "components/", "lib/"],
        capture_output=True, text=True, cwd=PROJECT_ROOT
    )

    exclude_patterns = [
        "lib/brand.ts", "lib/seo.ts", "lib/seo-tools.ts",
        "test", "mobile-app", "scripts/", "proxy.ts",
        "api/", "lib/features/availability.ts"
    ]

    hardcoded = [
        l for l in result.stdout.strip().split("\n")
        if l and not any(p in l for p in exclude_patterns)
    ]

    check(len(hardcoded) == 0, "No hardcoded URLs in source",
          f"{len(hardcoded)} remaining: {hardcoded[:3]}", "warn" if hardcoded else "pass")


# ============================================
# STEP 9: TYPESCRIPT PLAYWRIGHT TESTS
# ============================================
def run_ts_tests():
    """Run existing TypeScript Playwright tests."""
    print("\n🧪 Running TypeScript Playwright tests...")

    result = subprocess.run(
        ["npx", "playwright", "test", "--project=chromium", "--reporter=list"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        timeout=300,
        env={**os.environ, "CI": "1", "PLAYWRIGHT_SKIP_FIREFOX": "1"}
    )

    # Parse results
    output = result.stdout + result.stderr
    passed = output.count("✓") + output.count("passed")
    failed = output.count("✗") + output.count("failed")

    check(result.returncode == 0, f"Playwright tests passed",
          f"exit code: {result.returncode}", "fail" if result.returncode != 0 else "pass")

    if result.returncode != 0:
        # Show last 20 lines of output
        lines = output.strip().split("\n")
        for line in lines[-20:]:
            print(f"    {line}")


# ============================================
# MAIN
# ============================================
def main():
    print("=" * 60)
    print("🔍 PersianToolbox Hybrid QA System")
    print(f"   Target: {TARGET}")
    print("=" * 60)

    start = time.time()

    # Run all checks
    routes = discover_routes()
    print(f"\n📋 Discovered {len(routes)} routes from codebase")

    check_file_integrity()
    check_hardcoded_urls()
    crawl_links(routes)
    check_security()
    check_static_assets()
    check_seo()
    check_api()
    run_ts_tests()

    elapsed = round(time.time() - start, 1)

    # Summary
    total = RESULTS["pass"] + RESULTS["fail"] + RESULTS["warn"]
    print("\n" + "=" * 60)
    print("📊 HYBRID QA RESULTS")
    print("=" * 60)
    print(f"  ✅ Passed:   {RESULTS['pass']}")
    print(f"  ❌ Failed:   {RESULTS['fail']}")
    print(f"  ⚠️  Warnings: {RESULTS['warn']}")
    print(f"  📊 Total:    {total}")
    print(f"  📈 Score:    {round(RESULTS['pass'] / max(total, 1) * 100)}%")
    print(f"  ⏱️  Time:     {elapsed}s")

    if RESULTS["errors"]:
        print(f"\n🚨 FAILURES ({len(RESULTS['errors'])}):")
        for e in RESULTS["errors"][:15]:
            print(f"    • {e}")

    if RESULTS["warnings"]:
        print(f"\n⚠️  WARNINGS ({len(RESULTS['warnings'])}):")
        for w in RESULTS["warnings"][:10]:
            print(f"    • {w}")

    print("=" * 60)

    # Exit code: 1 if any failures
    sys.exit(1 if RESULTS["fail"] > 0 else 0)


if __name__ == "__main__":
    main()
