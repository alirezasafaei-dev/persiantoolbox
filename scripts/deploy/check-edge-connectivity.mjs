#!/usr/bin/env node
import { Resolver } from 'node:dns/promises';
import { performance } from 'node:perf_hooks';
import tls from 'node:tls';

const args = process.argv.slice(2);

const getArg = (name, fallback = '') => {
  const key = `--${name}=`;
  const exact = args.find((arg) => arg.startsWith(key));
  if (exact) {
    return exact.slice(key.length);
  }
  const index = args.indexOf(`--${name}`);
  if (index >= 0) {
    return args[index + 1] ?? fallback;
  }
  return fallback;
};

const isEnabled = (value) => ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

const baseUrl = getArg('base-url', 'https://persiantoolbox.ir');
const extraHostsArg = getArg('extra-hosts', '');
const probePath = getArg('path', '/api/health');
const expectedStatus = Number.parseInt(getArg('expected-status', '200'), 10) || 200;
const resolverList = getArg('resolvers', '1.1.1.1,8.8.8.8,9.9.9.9')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const dnsTimeoutMs = Math.max(800, Number.parseInt(getArg('dns-timeout-ms', '2200'), 10) || 2200);
const httpTimeoutMs = Math.max(
  1200,
  Number.parseInt(getArg('http-timeout-ms', '6500'), 10) || 6500,
);
const tlsTimeoutMs = Math.max(1200, Number.parseInt(getArg('tls-timeout-ms', '4500'), 10) || 4500);
const strict = isEnabled(getArg('strict', 'false'));

const withTimeout = async (promise, timeoutMs, label) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

function deriveCandidateHosts(urlValue) {
  const out = [];
  try {
    const parsed = new URL(urlValue);
    const host = parsed.hostname.toLowerCase();
    out.push(host);

    if (host.startsWith('www.')) {
      out.push(host.slice(4));
    } else if (host.split('.').length === 2) {
      out.push(`www.${host}`);
    }
  } catch {
    // ignore invalid base url and continue with provided extras only
  }
  return out;
}

const hosts = [
  ...deriveCandidateHosts(baseUrl),
  ...extraHostsArg
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
].filter((item, index, list) => list.indexOf(item) === index);

if (hosts.length === 0) {
  throw new Error('No hosts to probe. Provide --base-url or --extra-hosts.');
}

const dnsProbeForHost = async (host, resolverAddress) => {
  const resolver = new Resolver();
  resolver.setServers([resolverAddress]);

  const startedAt = performance.now();
  const ipv4 = new Set();
  const ipv6 = new Set();
  const errors = [];

  try {
    const ipv4Addresses = await withTimeout(
      resolver.resolve4(host),
      dnsTimeoutMs,
      `${host} A via ${resolverAddress}`,
    );
    for (const address of ipv4Addresses) {
      ipv4.add(address);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  try {
    const ipv6Addresses = await withTimeout(
      resolver.resolve6(host),
      dnsTimeoutMs,
      `${host} AAAA via ${resolverAddress}`,
    );
    for (const address of ipv6Addresses) {
      ipv6.add(address);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const ipv4List = Array.from(ipv4);
  const ipv6List = Array.from(ipv6);
  const addresses = [...ipv4List, ...ipv6List];

  return {
    host,
    resolver: resolverAddress,
    ok: addresses.length > 0,
    ipv4: ipv4List,
    ipv6: ipv6List,
    addresses,
    latencyMs: Math.round(performance.now() - startedAt),
    note: addresses.length > 0 ? 'resolved' : errors.join(' | '),
  };
};

const tlsProbeForAddress = (host, address, family) =>
  new Promise((resolve) => {
    const startedAt = performance.now();
    let done = false;

    const finish = (payload) => {
      if (done) {
        return;
      }
      done = true;
      resolve({
        host,
        address,
        family,
        latencyMs: Math.round(performance.now() - startedAt),
        ...payload,
      });
    };

    let socket;
    try {
      socket = tls.connect({
        host: address,
        port: 443,
        family,
        servername: host,
        rejectUnauthorized: true,
        ALPNProtocols: ['h2', 'http/1.1'],
      });
    } catch (error) {
      finish({
        ok: false,
        protocol: 'n/a',
        cipher: 'n/a',
        certCN: 'n/a',
        note: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    socket.setTimeout(tlsTimeoutMs);
    socket.once('secureConnect', () => {
      const peerCertificate = socket.getPeerCertificate();
      finish({
        ok: true,
        protocol: socket.getProtocol() ?? 'n/a',
        cipher: socket.getCipher()?.name ?? 'n/a',
        certCN: peerCertificate?.subject?.CN ?? 'n/a',
        note: 'ok',
      });
      socket.end();
    });

    socket.once('timeout', () => {
      socket.destroy(new Error(`TLS timed out after ${tlsTimeoutMs}ms`));
    });

    socket.once('error', (error) => {
      finish({
        ok: false,
        protocol: 'n/a',
        cipher: 'n/a',
        certCN: 'n/a',
        note: error instanceof Error ? error.message : String(error),
      });
    });

    socket.once('close', () => {
      if (!done) {
        finish({
          ok: false,
          protocol: 'n/a',
          cipher: 'n/a',
          certCN: 'n/a',
          note: 'TLS socket closed before handshake completed',
        });
      }
    });
  });

function collectHostAddresses(host, dnsRows) {
  const unique = new Set();
  const items = [];
  for (const row of dnsRows) {
    for (const address of row.ipv4 ?? []) {
      const key = `4:${address}`;
      if (!unique.has(key)) {
        unique.add(key);
        items.push({ address, family: 4 });
      }
    }
    for (const address of row.ipv6 ?? []) {
      const key = `6:${address}`;
      if (!unique.has(key)) {
        unique.add(key);
        items.push({ address, family: 6 });
      }
    }
  }
  return items;
}

const httpProbeForHost = async (host) => {
  const url = new URL(probePath, `https://${host}`).toString();
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), httpTimeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    return {
      host,
      url,
      ok: response.status === expectedStatus,
      status: response.status,
      latencyMs: Math.round(performance.now() - startedAt),
      serverHeader: response.headers.get('server') ?? 'n/a',
      hsts: response.headers.has('strict-transport-security'),
      note: response.status === expectedStatus ? 'ok' : `expected ${expectedStatus}`,
    };
  } catch (error) {
    const note = error instanceof Error ? error.message : String(error);
    return {
      host,
      url,
      ok: false,
      status: 'error',
      latencyMs: Math.round(performance.now() - startedAt),
      serverHeader: 'n/a',
      hsts: false,
      note,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

const dnsResults = [];
for (const host of hosts) {
  for (const resolverAddress of resolverList) {
    dnsResults.push(await dnsProbeForHost(host, resolverAddress));
  }
}

const httpResults = [];
for (const host of hosts) {
  httpResults.push(await httpProbeForHost(host));
}

const tlsResults = [];
for (const host of hosts) {
  const hostDns = dnsResults.filter((item) => item.host === host && item.ok);
  const hostAddresses = collectHostAddresses(host, hostDns);
  if (hostAddresses.length === 0) {
    continue;
  }
  const probes = await Promise.all(
    hostAddresses.map(({ address, family }) => tlsProbeForAddress(host, address, family)),
  );
  tlsResults.push(...probes);
}

const issues = [];
for (const host of hosts) {
  const hostDns = dnsResults.filter((item) => item.host === host);
  const dnsSuccessCount = hostDns.filter((item) => item.ok).length;
  if (dnsSuccessCount === 0) {
    issues.push(`DNS failed for ${host} across all resolvers`);
  }

  const hostHttp = httpResults.find((item) => item.host === host);
  if (!hostHttp?.ok) {
    issues.push(
      `HTTPS probe failed for ${host} (${hostHttp?.status ?? 'error'}: ${hostHttp?.note ?? 'unknown'})`,
    );
  }

  const hostTls = tlsResults.filter((item) => item.host === host);
  const tlsV4 = hostTls.filter((item) => item.family === 4);
  const tlsV6 = hostTls.filter((item) => item.family === 6);

  if (tlsV4.length > 0 && tlsV4.every((item) => !item.ok)) {
    issues.push(`TLS handshake failed for ${host} on all IPv4 addresses`);
  }
  if (tlsV6.length > 0 && tlsV6.every((item) => !item.ok)) {
    issues.push(`TLS handshake failed for ${host} on all IPv6 addresses`);
  }
}

console.log('[edge-check] DNS probes');
for (const row of dnsResults) {
  const addresses = row.addresses.length > 0 ? row.addresses.join(', ') : '-';
  const ipv4 = row.ipv4.length > 0 ? row.ipv4.join(', ') : '-';
  const ipv6 = row.ipv6.length > 0 ? row.ipv6.join(', ') : '-';
  console.log(
    `- host=${row.host} resolver=${row.resolver} ok=${row.ok} latency=${row.latencyMs}ms addresses=${addresses} ipv4=${ipv4} ipv6=${ipv6}`,
  );
}

console.log('[edge-check] HTTPS probes');
for (const row of httpResults) {
  console.log(
    `- host=${row.host} status=${row.status} ok=${row.ok} latency=${row.latencyMs}ms hsts=${row.hsts} server=${row.serverHeader}`,
  );
}

console.log('[edge-check] TLS probes');
for (const row of tlsResults) {
  console.log(
    `- host=${row.host} family=IPv${row.family} address=${row.address} ok=${row.ok} latency=${row.latencyMs}ms protocol=${row.protocol} cipher=${row.cipher} certCN=${row.certCN} note=${row.note}`,
  );
}

const output = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  probePath,
  expectedStatus,
  resolvers: resolverList,
  hosts,
  dnsTimeoutMs,
  httpTimeoutMs,
  tlsTimeoutMs,
  dns: dnsResults,
  https: httpResults,
  tls: tlsResults,
  issues,
};

console.log('[edge-check] raw json');
console.log(JSON.stringify(output, null, 2));

if (issues.length > 0) {
  if (strict) {
    console.error(`[edge-check] failed: ${issues.join(' | ')}`);
    process.exit(1);
  } else {
    console.warn(`[edge-check] warnings: ${issues.join(' | ')}`);
  }
}
