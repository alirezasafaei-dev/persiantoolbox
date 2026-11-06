import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const LEGACY = '/home/ubuntu/persiantoolbox/.next/standalone/public/fonts/';
const UPSTREAM = 'http://persiantoolbox_backend';

// Retain byte offsets; never regenerate unrelated nginx directives. Quoted strings,
// comments and escaped delimiters cannot become structural braces.
function parse(text) {
  const pattern =
    /\s+|#[^\n]*|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[{};]|(?:\\[\s\S]|[^\s{};#"'\\])+/gy;
  const tokens = [];
  let position = 0;
  while (position < text.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(text);
    if (!match) throw new Error('Unsupported nginx token');
    position = pattern.lastIndex;
    if (/^\s|^#/.test(match[0])) continue;
    tokens.push({ value: match[0], start: match.index, end: position });
  }
  let cursor = 0;
  function directives(nested = false) {
    const result = [];
    while (cursor < tokens.length) {
      if (tokens[cursor].value === '}') {
        if (!nested) throw new Error('Unexpected closing nginx brace');
        cursor++;
        return result;
      }
      const start = tokens[cursor].start;
      const words = [];
      while (cursor < tokens.length && !['{', '}', ';'].includes(tokens[cursor].value)) {
        words.push(tokens[cursor++].value);
      }
      if (!words.length || cursor === tokens.length) throw new Error('Incomplete nginx directive');
      const delimiter = tokens[cursor++];
      if (delimiter.value === '}') throw new Error('Missing nginx semicolon');
      const children = delimiter.value === '{' ? directives(true) : null;
      result.push({ words, start, end: tokens[cursor - 1].end, children });
    }
    if (nested) throw new Error('Unclosed nginx block');
    return result;
  }
  return directives();
}

function productionFonts(text) {
  const locations = [];
  for (const server of parse(text)) {
    if (server.words.join(' ') !== 'server' || !server.children) continue;
    const names = server.children.filter((d) => d.words[0] === 'server_name');
    if (!names.some((d) => d.words.slice(1).includes('persiantoolbox.ir'))) continue;
    const fonts = server.children.filter(
      (d) => d.words[0] === 'location' && d.words.at(-1) === '/fonts/',
    );
    if (!fonts.length) continue; // HTTP/www redirect-only servers are untouched.
    if (
      names.length !== 1 ||
      names[0].words
        .slice(1)
        .some((name) => !['persiantoolbox.ir', 'www.persiantoolbox.ir'].includes(name))
    ) {
      throw new Error('Production server has ambiguous host names');
    }
    if (
      !server.children.some(
        (d) => d.words[0] === 'listen' && d.words.includes('443') && d.words.includes('ssl'),
      )
    ) {
      throw new Error('Expected production TLS server');
    }
    if (
      fonts.length !== 1 ||
      fonts[0].words.join(' ') !== 'location /fonts/' ||
      !fonts[0].children
    ) {
      throw new Error('Expected one plain production fonts location');
    }
    locations.push(fonts[0]);
  }
  return locations;
}

export function reconcileFontRouting(text) {
  const locations = productionFonts(text);
  if (locations.length !== 1) throw new Error('Expected exactly one production fonts location');
  const location = locations[0];
  const allowed = new Set(['alias', 'proxy_pass', 'expires', 'add_header', 'access_log']);
  if (location.children.some((d) => d.children || !allowed.has(d.words[0]))) {
    throw new Error('Unsupported production fonts directive');
  }
  const routes = location.children.filter((d) => ['alias', 'proxy_pass'].includes(d.words[0]));
  if (routes.length !== 1) throw new Error('Expected exactly one fonts route');
  const route = routes[0];
  if (route.words.join(' ') === `proxy_pass ${UPSTREAM}`) return text;
  if (route.words.join(' ') !== `alias ${LEGACY}`)
    throw new Error('Unknown fonts route; refusing edit');
  return text.slice(0, route.start) + `proxy_pass ${UPSTREAM};` + text.slice(route.end);
}

// nginx -T is a read-only inventory of loaded files, including symlinked vhosts.
// Only the exact matching file is emitted; the shell owns backup/atomic install.
export function reconcileNginxDump(dump) {
  const sections = [...dump.matchAll(/^# configuration file (\/etc\/nginx\/[^\r\n]+):\r?\n/gm)];
  const matches = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const content = dump.slice(
      section.index + section[0].length,
      sections[i + 1]?.index ?? dump.length,
    );
    if (!productionFonts(content).length) continue;
    matches.push({ file: section[1], original: content, updated: reconcileFontRouting(content) });
  }
  if (matches.length !== 1) throw new Error('Expected one loaded production font configuration');
  return matches[0];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [mode, input, output] = process.argv.slice(2);
    if (!input || !output) throw new Error('Expected mode, input and output paths');
    const text = readFileSync(input, 'utf8');
    if (mode === '--select') {
      writeFileSync(output, reconcileNginxDump(text).file, { mode: 0o600 });
    } else if (mode === '--transform') {
      writeFileSync(output, reconcileFontRouting(text), { mode: 0o600 });
    } else {
      throw new Error('Unknown transform mode');
    }
  } catch (error) {
    console.error(`[invoice-font-routing] ${error.message}`);
    process.exitCode = 1;
  }
}
