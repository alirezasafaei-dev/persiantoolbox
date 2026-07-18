import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getPlausibleOrigin, isPlausiblePilotEnabled } from '@/lib/analytics/plausibleConfig';

const generalCspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https://trustseal.enamad.ir",
  "font-src 'self' data:",
  "connect-src 'self' https://o4511624450670592.ingest.de.sentry.io",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
];

const enforcedOnlyCspDirectives = ['upgrade-insecure-requests'];

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Permissions-Policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
};

function getHstsHosts(): Set<string> {
  return new Set(
    (process.env['HSTS_HOSTS'] ?? 'persiantoolbox.ir')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function shouldEnableHsts(): boolean {
  return process.env['NODE_ENV'] === 'production' && process.env['DISABLE_HSTS'] !== '1';
}

function normalizeHostname(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const firstHost = value.split(',')[0]?.trim().toLowerCase() ?? '';
  if (!firstHost) {
    return null;
  }
  return firstHost.replace(/:\d+$/, '');
}

function resolveRequestHostname(request: NextRequest): string {
  const forwardedHost = normalizeHostname(request.headers.get('x-forwarded-host'));
  if (forwardedHost) {
    return forwardedHost;
  }
  const host = normalizeHostname(request.headers.get('host'));
  if (host) {
    return host;
  }
  return request.nextUrl.hostname.toLowerCase();
}

export function buildCsp(nonce: string) {
  const devScriptAllowance = process.env['NODE_ENV'] === 'production' ? '' : " 'unsafe-eval'";
  const nonceSource = nonce ? ` 'nonce-${nonce}'` : '';
  const plausibleOrigin = isPlausiblePilotEnabled() ? getPlausibleOrigin() : null;
  const directives = [
    ...generalCspDirectives.slice(0, 7),
    `script-src 'self'${nonceSource}${devScriptAllowance}${plausibleOrigin ? ` ${plausibleOrigin}` : ''}`,
    "style-src 'self' 'unsafe-inline'",
    ...generalCspDirectives.slice(7),
    ...enforcedOnlyCspDirectives,
  ];
  return directives
    .map((directive) =>
      plausibleOrigin && directive.startsWith('connect-src ')
        ? `${directive} ${plausibleOrigin}`
        : directive,
    )
    .join('; ');
}

export function buildReportOnlyCsp(nonce: string) {
  const devScriptAllowance = process.env['NODE_ENV'] === 'production' ? '' : " 'unsafe-eval'";
  const nonceSource = nonce ? ` 'nonce-${nonce}'` : '';
  const plausibleOrigin = isPlausiblePilotEnabled() ? getPlausibleOrigin() : null;
  const directives = [
    ...generalCspDirectives.slice(0, 7),
    `script-src 'self'${nonceSource}${devScriptAllowance}${plausibleOrigin ? ` ${plausibleOrigin}` : ''}`,
    "style-src 'self' 'unsafe-inline'",
    ...generalCspDirectives.slice(7),
  ];
  return directives
    .map((directive) =>
      plausibleOrigin && directive.startsWith('connect-src ')
        ? `${directive} ${plausibleOrigin}`
        : directive,
    )
    .join('; ');
}

export function buildStrictCsp(nonce: string) {
  const devScriptAllowance = process.env['NODE_ENV'] === 'production' ? '' : " 'unsafe-eval'";
  const nonceSource = nonce ? ` 'nonce-${nonce}'` : '';
  const plausibleOrigin = isPlausiblePilotEnabled() ? getPlausibleOrigin() : null;
  const directives = [
    ...generalCspDirectives.slice(0, 7),
    `script-src 'self'${nonceSource}${devScriptAllowance}${plausibleOrigin ? ` ${plausibleOrigin}` : ''}`,
    `style-src 'self'${nonceSource}`,
    "style-src-attr 'unsafe-inline'",
    ...generalCspDirectives.slice(7),
  ];
  return directives
    .map((directive) =>
      plausibleOrigin && directive.startsWith('connect-src ')
        ? `${directive} ${plausibleOrigin}`
        : directive,
    )
    .join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  const csp = buildCsp(nonce);
  const reportOnlyCsp = buildReportOnlyCsp(nonce);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-csp-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', reportOnlyCsp);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-correlation-id', requestId);

  const hostname = resolveRequestHostname(request);

  // www -> non-www redirect (permanent, preserves path and query string)
  const isProduction = process.env['NODE_ENV'] === 'production';
  if (isProduction && hostname.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.hostname = 'persiantoolbox.ir';
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', csp);
  // Report-only intentionally mirrors the compatible inline allowances while
  // omitting upgrade-insecure-requests. A nonce is still generated once per
  // request for callers, but strict nonce CSP is held until inline Next.js
  // scripts/styles are migrated and enforcement would not create false reports.
  response.headers.set('Content-Security-Policy-Report-Only', reportOnlyCsp);
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-correlation-id', requestId);

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  const pathname = request.nextUrl.pathname;
  const isApiOrAdmin = pathname.startsWith('/api/') || pathname.startsWith('/admin/');
  if (!isApiOrAdmin) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  if (shouldEnableHsts() && getHstsHosts().has(hostname)) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }

  return response;
}

export const middleware = proxy;

export const config = {
  matcher: '/:path*',
};
