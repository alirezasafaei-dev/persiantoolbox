const EVENT_HANDLER_RE = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const SCRIPT_OPEN_RE = /<script\b[^>]*\/?>/gi;
const JAVASCRIPT_URL_RE = /href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi;
const JAVASCRIPT_SRC_RE = /src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(SCRIPT_RE, '')
    .replace(SCRIPT_OPEN_RE, '')
    .replace(JAVASCRIPT_URL_RE, '')
    .replace(JAVASCRIPT_SRC_RE, '')
    .replace(EVENT_HANDLER_RE, '');
}
