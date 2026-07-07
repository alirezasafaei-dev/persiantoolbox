#!/usr/bin/env node

const args = process.argv.slice(2);

const getArgValue = (flag, fallback) => {
  const index = args.indexOf(flag);
  if (index === -1) {
    return fallback;
  }
  return args[index + 1] ?? fallback;
};

const BASE_URL = getArgValue('--base-url', 'https://persiantoolbox.ir');
const LIMIT = Number(getArgValue('--limit', '60'));
const CONCURRENCY = Number(getArgValue('--concurrency', '6'));
const TIMEOUT_MS = Number(getArgValue('--timeout-ms', '20000'));
const FULL_SCAN = args.includes('--full');

const canonicalizeUrl = (value) => {
  try {
    const url = new URL(value);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    url.hash = '';
    return url.toString();
  } catch {
    return value;
  }
};

const parseSitemapLocs = (xml) => {
  const matches = xml.match(/<loc>([^<]+)<\/loc>/gi) ?? [];
  return matches.map((match) => match.replace(/<\/?loc>/gi, '').trim()).filter(Boolean);
};

const parseRobotsDisallows = (content) =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^disallow:/i.test(line))
    .map((line) => line.replace(/^disallow:\s*/i, '').trim())
    .filter(Boolean);

const isBlockedByRobots = (url, disallows) => {
  const target = new URL(url);
  const pathWithSearch = `${target.pathname}${target.search}`;
  return disallows.some((rule) => {
    if (rule === '/') {
      return true;
    }
    if (rule.endsWith('?')) {
      return pathWithSearch.startsWith(rule);
    }
    return target.pathname.startsWith(rule);
  });
};

const extractCanonical = (html) => {
  const match = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
  );
  return match?.[1]?.trim() ?? '';
};

const hasNoindex = (html, xRobotsHeader) => {
  const robotsMeta = [
    ...html.matchAll(
      /<meta[^>]+name=["'](?:robots|googlebot)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    ),
  ]
    .map((match) => match[1]?.toLowerCase() ?? '')
    .join(',');

  const xRobots = (xRobotsHeader ?? '').toLowerCase();
  return robotsMeta.includes('noindex') || xRobots.includes('noindex');
};

const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  return { response, text };
};

const auditUrl = async (url, disallows) => {
  const issues = [];

  if (isBlockedByRobots(url, disallows)) {
    issues.push('robots-blocked');
  }

  let response;
  let text;
  try {
    const result = await fetchText(url, { redirect: 'manual' });
    response = result.response;
    text = result.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    issues.push(`request-failed:${message}`);
    return { url, issues };
  }

  if (response.status >= 300 && response.status < 400) {
    issues.push(`redirect:${response.status}`);
  } else if (response.status !== 200) {
    issues.push(`status:${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    issues.push(`content-type:${contentType || 'unknown'}`);
  }

  if (hasNoindex(text, response.headers.get('x-robots-tag'))) {
    issues.push('noindex');
  }

  const canonical = extractCanonical(text);
  if (!canonical) {
    issues.push('canonical-missing');
  } else if (canonicalizeUrl(canonical) !== canonicalizeUrl(url)) {
    issues.push(`canonical-mismatch:${canonical}`);
  }

  return {
    url,
    issues,
  };
};

const runQueue = async (items, worker, concurrency) => {
  const results = [];
  let cursor = 0;

  const runners = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  });

  await Promise.all(runners);
  return results;
};

const run = async () => {
  const robotsUrl = new URL('/robots.txt', BASE_URL).toString();
  const sitemapUrl = new URL('/sitemap.xml', BASE_URL).toString();

  const [{ text: robotsText }, { text: sitemapText }] = await Promise.all([
    fetchText(robotsUrl),
    fetchText(sitemapUrl),
  ]);

  const disallows = parseRobotsDisallows(robotsText);
  const sitemapLocs = parseSitemapLocs(sitemapText);
  const selectedUrls = FULL_SCAN ? sitemapLocs : sitemapLocs.slice(0, LIMIT);

  console.log(`[audit] base=${BASE_URL}`);
  console.log(
    `[audit] sitemap_urls=${sitemapLocs.length} scanned=${selectedUrls.length} timeout_ms=${TIMEOUT_MS}`,
  );

  const results = await runQueue(selectedUrls, (url) => auditUrl(url, disallows), CONCURRENCY);
  const failures = results.filter((result) => result.issues.length > 0);

  if (failures.length === 0) {
    console.log('[audit] sitemap indexability passed');
    return;
  }

  console.log(`[audit] issues=${failures.length}`);
  failures.slice(0, 50).forEach((failure) => {
    console.log(`- ${failure.url}`);
    failure.issues.forEach((issue) => {
      console.log(`  • ${issue}`);
    });
  });

  if (failures.length > 50) {
    console.log(`[audit] ${failures.length - 50} more URLs omitted`);
  }

  process.exitCode = 1;
};

run().catch((error) => {
  console.error('[audit] failed', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
