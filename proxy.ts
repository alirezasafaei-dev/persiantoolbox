import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const generalCspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  'upgrade-insecure-requests',
];

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
    (process.env['HSTS_HOSTS'] ?? 'persiantoolbox.ir,www.persiantoolbox.ir')
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
  const directives = [
    ...generalCspDirectives.slice(0, 8),
    `script-src 'self' 'nonce-${nonce}'${devScriptAllowance}`,
    ...generalCspDirectives.slice(8),
  ];
  return directives.join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-csp-nonce', nonce);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-correlation-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-correlation-id', requestId);

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  const hostname = resolveRequestHostname(request);
  if (shouldEnableHsts() && getHstsHosts().has(hostname)) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
