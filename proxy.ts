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
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
};

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
  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-csp-nonce', nonce);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  response.headers.set('x-request-id', requestId);

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  if (process.env['NODE_ENV'] === 'production') {
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
