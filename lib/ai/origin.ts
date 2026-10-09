/**
 * In production, the trusted public origin is the canonical website origin,
 * not NextRequest.url. A reverse proxy can present an internal upstream URL
 * to the Node.js server, even when the browser sent a legitimate HTTPS Origin.
 *
 * Do not trust Host or X-Forwarded-* supplied by the client for this decision.
 */
const PRODUCTION_ORIGIN = 'https://persiantoolbox.ir';

export function isAllowedAiChatOrigin(
  suppliedOrigin: string,
  requestUrl: string,
  production: boolean,
): boolean {
  try {
    const origin = new URL(suppliedOrigin).origin;
    if (origin === 'null') {
      return false;
    }

    const trustedOrigin = production ? PRODUCTION_ORIGIN : new URL(requestUrl).origin;
    return origin === trustedOrigin;
  } catch {
    return false;
  }
}
