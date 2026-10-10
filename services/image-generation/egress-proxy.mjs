import dns from 'node:dns/promises';
import http from 'node:http';
import net from 'node:net';
import { pathToFileURL } from 'node:url';

const ALLOWED_HOSTS = new Set(['flatai.org', 'www.flatai.org']);
const CONNECT_TIMEOUT_MS = 15_000;
const TUNNEL_TIMEOUT_MS = 60_000;

export function parseConnectAuthority(authority) {
  if (typeof authority !== 'string' || !/^[a-z0-9.-]+:443$/.test(authority)) return null;
  const separator = authority.lastIndexOf(':');
  const host = authority.slice(0, separator);
  if (!ALLOWED_HOSTS.has(host)) return null;
  return { host, port: 443 };
}

export function isPublicAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family !== 6 || address.toLowerCase().includes('.')) return false;
  const value = ipv6ToBigInt(address);
  if (value === null) return false;
  if (!matchesPrefix(value, 0x2000n << 112n, 3n)) return false;
  return ![
    [0n, 128n], // ::/128
    [1n, 128n], // ::1/128
    [0xffffn << 32n, 96n], // IPv4-mapped IPv6
    [0xfcn << 120n, 7n], // unique local
    [0xfe80n << 112n, 10n], // link local
    [0xffn << 120n, 8n], // multicast
    [0x20010db8n << 96n, 32n], // documentation
    [0x20010000n << 96n, 32n], // Teredo
    [0x200100020000n << 80n, 48n], // benchmarking
    [0x2002n << 112n, 16n], // 6to4
  ].some(([prefix, bits]) => matchesPrefix(value, prefix, bits));
}

function isPublicIpv4(address) {
  const value = address.split('.').reduce((number, part) => (number << 8) | Number(part), 0) >>> 0;
  return ![
    [0x00000000, 8],
    [0x0a000000, 8],
    [0x64400000, 10],
    [0x7f000000, 8],
    [0xa9fe0000, 16],
    [0xac100000, 12],
    [0xc0000000, 24],
    [0xc0000200, 24],
    [0xc0586300, 24],
    [0xc0a80000, 16],
    [0xc6120000, 15],
    [0xc6336400, 24],
    [0xcb007100, 24],
    [0xe0000000, 4],
    [0xf0000000, 4],
  ].some(([prefix, bits]) => matchesPrefix(BigInt(value), BigInt(prefix), BigInt(bits), 32n));
}

function ipv6ToBigInt(address) {
  const pieces = address.toLowerCase().split('::');
  if (pieces.length > 2) return null;
  const left = pieces[0] ? pieces[0].split(':') : [];
  const right = pieces.length === 2 && pieces[1] ? pieces[1].split(':') : [];
  if (left.length + right.length > 8 || (pieces.length === 1 && left.length !== 8)) return null;
  const groups = [...left, ...Array(8 - left.length - right.length).fill('0'), ...right];
  if (groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.reduce((value, group) => (value << 16n) | BigInt(`0x${group}`), 0n);
}

function matchesPrefix(value, prefix, bits, width = 128n) {
  const mask = ((1n << bits) - 1n) << (width - bits);
  return (value & mask) === (prefix & mask);
}

export async function resolveVerifiedAddress(
  host,
  resolver = dns.lookup,
  { timeoutMs = CONNECT_TIMEOUT_MS } = {},
) {
  let answers;
  try {
    answers = await withTimeout(resolver(host, { all: true, verbatim: true }), timeoutMs);
  } catch {
    throw new Error('destination_rejected');
  }
  if (
    !Array.isArray(answers) ||
    answers.length === 0 ||
    answers.some(({ address }) => !isPublicAddress(address))
  )
    throw new Error('destination_rejected');
  return answers[0].address;
}

export function createEgressProxy({
  resolver = dns.lookup,
  dial = defaultDial,
  resolverTimeoutMs = CONNECT_TIMEOUT_MS,
  connectTimeoutMs = CONNECT_TIMEOUT_MS,
} = {}) {
  const server = http.createServer({ maxHeaderSize: 8192 }, (request, response) => {
    response.writeHead(405, { Connection: 'close' });
    response.end();
  });
  server.maxConnections = 32;
  server.headersTimeout = CONNECT_TIMEOUT_MS;
  server.requestTimeout = CONNECT_TIMEOUT_MS;
  server.keepAliveTimeout = 5000;
  server.on('connection', (socket) =>
    socket.setTimeout(CONNECT_TIMEOUT_MS, () => socket.destroy()),
  );
  server.on('clientError', (_error, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
  });
  server.on('connect', async (request, client, head) => {
    const destination = parseConnectAuthority(request.url);
    if (!destination) return reject(client);
    let address;
    try {
      address = await resolveVerifiedAddress(destination.host, resolver, {
        timeoutMs: resolverTimeoutMs,
      });
    } catch {
      return reject(client);
    }
    let upstream;
    try {
      upstream = dial(address, destination.port);
      await onceConnected(upstream, connectTimeoutMs);
    } catch {
      upstream?.destroy();
      return reject(client, 502);
    }
    client.setTimeout(TUNNEL_TIMEOUT_MS, () => client.destroy());
    upstream.setTimeout(TUNNEL_TIMEOUT_MS, () => upstream.destroy());
    client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (head.length > 0) upstream.write(head);
    upstream.pipe(client);
    client.pipe(upstream);
    client.once('close', () => upstream.destroy());
    upstream.once('close', () => client.destroy());
    client.once('error', () => upstream.destroy());
    upstream.once('error', () => client.destroy());
  });
  return server;
}

function defaultDial(address, port) {
  return net.createConnection({ host: address, port, family: net.isIP(address) });
}

function onceConnected(socket, timeoutMs) {
  return new Promise((resolve, reject) => {
    let timer;
    const cleanup = () => {
      clearTimeout(timer);
      socket.off('connect', connected);
      socket.off('error', failed);
    };
    const connected = () => {
      cleanup();
      resolve();
    };
    const failed = () => {
      cleanup();
      reject(new Error('upstream_failed'));
    };
    timer = setTimeout(() => {
      cleanup();
      socket.destroy();
      reject(new Error('upstream_timeout'));
    }, timeoutMs);
    socket.once('connect', connected);
    socket.once('error', failed);
  });
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function reject(socket, status = 403) {
  socket.end(
    `HTTP/1.1 ${status} ${status === 403 ? 'Forbidden' : 'Bad Gateway'}\r\nConnection: close\r\n\r\n`,
  );
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const server = createEgressProxy();
  server.listen(3128, '0.0.0.0');
  for (const event of ['SIGINT', 'SIGTERM'])
    process.on(event, () => server.close(() => process.exit(0)));
}
