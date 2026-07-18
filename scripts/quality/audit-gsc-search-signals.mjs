#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

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
const REPORT_PATH = getArgValue('--report', 'reports/seo/gsc-search-signals.json');
const VARIANT_LIMIT = Number(getArgValue('--variant-limit', '25'));
const FULL_SCAN = args.includes('--full');
const CHECK_WWW = args.includes('--check-www');
const STRICT_WARNINGS = args.includes('--strict-warnings');

const canonicalizeUrl = (value) => {
  try {
    const url = new URL(value);
    url.hostname = url.hostname.toLowerCase();
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

const extractCanonical = (html) => {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? '';
    if (!rel.split(/\s+/).some((value) => value.toLowerCase() === 'canonical')) {
      continue;
    }
    return tag.match(/\bhref=["']([^"']+)["']/i)?.[1]?.trim() ?? '';
  }
  return '';
};

const decodeJsonLdText = (value) =>
  value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const extractJsonLdDocuments = (html) => {
  const documents = [];
  const warnings = [];
  const pattern = /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let index = 0;

  while ((match = pattern.exec(html)) !== null) {
    index += 1;
    const raw = decodeJsonLdText(match[1]?.trim() ?? '');
    if (!raw) {
      warnings.push(`jsonld-empty:${index}`);
      continue;
    }

    try {
      documents.push(JSON.parse(raw));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warnings.push(`jsonld-parse-error:${index}:${message}`);
    }
  }

  return { documents, warnings };
};

const normalizeTypes = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }
  return typeof value === 'string' ? [value] : [];
};

const collectTypedNodes = (value, targetType, result = []) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTypedNodes(item, targetType, result);
    }
    return result;
  }

  if (!value || typeof value !== 'object') {
    return result;
  }

  if (normalizeTypes(value['@type']).includes(targetType)) {
    result.push(value);
  }

  for (const nested of Object.values(value)) {
    collectTypedNodes(nested, targetType, result);
  }

  return result;
};

const hasMeaningfulValue = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.some(hasMeaningfulValue);
  }
  if (value && typeof value === 'object') {
    return ['name', '@id', 'url', 'sameAs'].some((key) => hasMeaningfulValue(value[key]));
  }
  return false;
};

const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'user-agent': 'PersianToolbox-GSC-Audit/1.0',
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  return { response, text };
};

const auditPage = async (url) => {
  const issues = [];
  const warnings = [];
  const datasets = [];

  let response;
  let text;
  try {
    const result = await fetchText(url, { redirect: 'manual' });
    response = result.response;
    text = result.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    issues.push(`request-failed:${message}`);
    return { url, issues, warnings, datasets };
  }

  if (response.status >= 300 && response.status < 400) {
    issues.push(`redirect:${response.status}`);
  } else if (response.status !== 200) {
    issues.push(`status:${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    issues.push(`content-type:${contentType || 'unknown'}`);
    return { url, issues, warnings, datasets };
  }

  const canonical = extractCanonical(text);
  if (!canonical) {
    issues.push('canonical-missing');
  } else if (canonicalizeUrl(canonical) !== canonicalizeUrl(url)) {
    issues.push(`canonical-mismatch:${canonical}`);
  }

  const jsonLd = extractJsonLdDocuments(text);
  warnings.push(...jsonLd.warnings);

  const datasetNodes = jsonLd.documents.flatMap((document) =>
    collectTypedNodes(document, 'Dataset'),
  );

  datasetNodes.forEach((dataset, index) => {
    const record = {
      index: index + 1,
      name: typeof dataset.name === 'string' ? dataset.name : null,
      hasDescription: hasMeaningfulValue(dataset.description),
      hasCreator: hasMeaningfulValue(dataset.creator),
    };
    datasets.push(record);

    if (!hasMeaningfulValue(dataset.name)) {
      issues.push(`dataset-name-missing:${index + 1}`);
    }
    if (!hasMeaningfulValue(dataset.description)) {
      issues.push(`dataset-description-missing:${index + 1}`);
    }
    if (!hasMeaningfulValue(dataset.creator)) {
      warnings.push(`dataset-creator-missing:${index + 1}`);
    }
  });

  return { url, canonical, status: response.status, issues, warnings, datasets };
};

const toWwwUrl = (value) => {
  const url = new URL(value);
  if (!url.hostname.startsWith('www.')) {
    url.hostname = `www.${url.hostname}`;
  }
  return url.toString();
};

const auditWwwVariant = async (canonicalUrl) => {
  const variantUrl = toWwwUrl(canonicalUrl);
  const issues = [];

  let first;
  try {
    first = await fetch(variantUrl, {
      redirect: 'manual',
      headers: { 'user-agent': 'PersianToolbox-GSC-Audit/1.0' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { canonicalUrl, variantUrl, issues: [`www-request-failed:${message}`] };
  }

  const locationHeader = first.headers.get('location');
  const firstLocation = locationHeader ? new URL(locationHeader, variantUrl).toString() : null;

  if (![301, 308].includes(first.status)) {
    issues.push(`www-status:${first.status}`);
  }
  if (!firstLocation) {
    issues.push('www-location-missing');
  } else if (canonicalizeUrl(firstLocation) !== canonicalizeUrl(canonicalUrl)) {
    issues.push(`www-location-mismatch:${firstLocation}`);
  }

  let finalUrl = null;
  try {
    const final = await fetch(variantUrl, {
      redirect: 'follow',
      headers: { 'user-agent': 'PersianToolbox-GSC-Audit/1.0' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    finalUrl = final.url;
    if (canonicalizeUrl(final.url) !== canonicalizeUrl(canonicalUrl)) {
      issues.push(`www-final-url-mismatch:${final.url}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    issues.push(`www-follow-failed:${message}`);
  }

  return {
    canonicalUrl,
    variantUrl,
    status: first.status,
    firstLocation,
    finalUrl,
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
  const sitemapUrl = new URL('/sitemap.xml', BASE_URL).toString();
  const { response: sitemapResponse, text: sitemapText } = await fetchText(sitemapUrl);
  if (!sitemapResponse.ok) {
    throw new Error(`Sitemap request failed with HTTP ${sitemapResponse.status}`);
  }

  const sitemapLocs = parseSitemapLocs(sitemapText);
  const selectedUrls = FULL_SCAN ? sitemapLocs : sitemapLocs.slice(0, LIMIT);

  console.log(`[gsc-audit] base=${BASE_URL}`);
  console.log(
    `[gsc-audit] sitemap_urls=${sitemapLocs.length} scanned=${selectedUrls.length} timeout_ms=${TIMEOUT_MS}`,
  );

  const pages = await runQueue(selectedUrls, auditPage, CONCURRENCY);
  const datasetPages = pages.filter((page) => page.datasets.length > 0);
  const pageIssues = pages.filter((page) => page.issues.length > 0);
  const pageWarnings = pages.filter((page) => page.warnings.length > 0);

  const variants = CHECK_WWW
    ? await runQueue(selectedUrls.slice(0, VARIANT_LIMIT), auditWwwVariant, CONCURRENCY)
    : [];
  const variantIssues = variants.filter((variant) => variant.issues.length > 0);

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    sitemapUrl,
    summary: {
      sitemapUrls: sitemapLocs.length,
      scannedPages: selectedUrls.length,
      pagesWithDataset: datasetPages.length,
      datasetNodes: datasetPages.reduce((sum, page) => sum + page.datasets.length, 0),
      pageIssueCount: pageIssues.length,
      pageWarningCount: pageWarnings.length,
      checkedWwwVariants: variants.length,
      wwwVariantIssueCount: variantIssues.length,
    },
    pages,
    variants,
  };

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `[gsc-audit] datasets=${report.summary.datasetNodes} dataset_pages=${report.summary.pagesWithDataset}`,
  );
  console.log(
    `[gsc-audit] page_issues=${report.summary.pageIssueCount} page_warnings=${report.summary.pageWarningCount}`,
  );
  if (CHECK_WWW) {
    console.log(
      `[gsc-audit] www_checked=${report.summary.checkedWwwVariants} www_issues=${report.summary.wwwVariantIssueCount}`,
    );
  }

  for (const page of [...pageIssues, ...pageWarnings].slice(0, 50)) {
    console.log(`- ${page.url}`);
    page.issues.forEach((issue) => console.log(`  issue: ${issue}`));
    page.warnings.forEach((warning) => console.log(`  warning: ${warning}`));
  }

  for (const variant of variantIssues.slice(0, 25)) {
    console.log(`- ${variant.variantUrl}`);
    variant.issues.forEach((issue) => console.log(`  issue: ${issue}`));
  }

  if (pageIssues.length > 0 || variantIssues.length > 0) {
    process.exitCode = 1;
  } else if (STRICT_WARNINGS && pageWarnings.length > 0) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error('[gsc-audit] failed', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
