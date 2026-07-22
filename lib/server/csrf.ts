export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');
  const requestOrigin = new URL(request.url).origin;

  // Behind reverse proxy: reconstruct the original origin
  if (forwardedProto && host) {
    // Harden proxy trust: only accept known protocols to prevent injection
    const safeProto =
      forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : null;
    const proxyOrigin = safeProto ? `${safeProto}://${host}` : null;
    if (proxyOrigin && origin) {
      return origin === proxyOrigin;
    }
    if (proxyOrigin && referer) {
      try {
        return new URL(referer).origin === proxyOrigin;
      } catch {
        return false;
      }
    }
    // Without origin/referer, trust only if the host header is a private/local IP (reverse proxy scenario)
    const hostname = host.split(':')[0] ?? host;
    const isPrivate = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|localhost)$/i.test(
      hostname,
    );
    return isPrivate;
  }

  if (origin) {
    return origin === requestOrigin;
  }

  if (referer) {
    try {
      return new URL(referer).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  // Reject state-changing requests without origin or referer headers.
  // Legitimate browsers always send at least one of these headers.
  return false;
}
