export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');
  const requestOrigin = new URL(request.url).origin;

  // Behind reverse proxy: reconstruct the original origin
  if (forwardedProto && host) {
    const proxyOrigin = `${forwardedProto}://${host}`;
    if (origin) {
      return origin === proxyOrigin;
    }
    if (referer) {
      try {
        return new URL(referer).origin === proxyOrigin;
      } catch {
        return false;
      }
    }
    return true; // trust proxy if no origin/referer but proto+host present
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
