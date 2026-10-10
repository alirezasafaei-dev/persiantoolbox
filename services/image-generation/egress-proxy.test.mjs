import assert from 'node:assert/strict';
import net from 'node:net';
import test from 'node:test';
import {
  createEgressProxy,
  isPublicAddress,
  parseConnectAuthority,
  resolveVerifiedAddress,
} from './egress-proxy.mjs';

test('accepts deterministic public IPv4 and IPv6 addresses only', () => {
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
  for (const address of [
    '0.0.0.0',
    '10.0.0.1',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.1.1',
    '172.16.0.1',
    '192.0.2.1',
    '192.168.1.1',
    '198.18.0.1',
    '224.0.0.1',
    '240.0.0.1',
    '::',
    '::1',
    '::ffff:8.8.8.8',
    'fc00::1',
    'fe80::1',
    'ff02::1',
    '2001:db8::1',
    '100::1',
    '2001::1',
    '2001:2::1',
    '2002::1',
  ])
    assert.equal(isPublicAddress(address), false, address);
});

test('permits only exact provider CONNECT authorities on port 443', () => {
  assert.deepEqual(parseConnectAuthority('flatai.org:443'), { host: 'flatai.org', port: 443 });
  assert.deepEqual(parseConnectAuthority('www.flatai.org:443'), {
    host: 'www.flatai.org',
    port: 443,
  });
  for (const value of [
    'flatai.org:80',
    'evil.flatai.org:443',
    'flatai.org.:443',
    'flatai.org:443/path',
    'user@flatai.org:443',
    'flatai.org:443@evil',
    '127.0.0.1:443',
    '[::1]:443',
  ])
    assert.equal(parseConnectAuthority(value), null, value);
});

test('rejects a hostname when any DNS answer is non-public', async () => {
  await assert.rejects(
    resolveVerifiedAddress('flatai.org', async () => [
      { address: '8.8.8.8', family: 4 },
      { address: '127.0.0.1', family: 4 },
    ]),
    { message: 'destination_rejected' },
  );
});

test('bounds DNS resolution before any outbound connection is possible', async () => {
  await assert.rejects(
    resolveVerifiedAddress('flatai.org', () => new Promise(() => {}), { timeoutMs: 10 }),
    { message: 'destination_rejected' },
  );
});

test('does not dial for rejected CONNECT requests', async () => {
  let dials = 0;
  const proxy = createEgressProxy({
    resolver: async () => [{ address: '127.0.0.1', family: 4 }],
    dial: () => {
      dials++;
      throw new Error('must not dial');
    },
  });
  await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
  const { port } = proxy.address();
  const response = await rawRequest(
    port,
    'CONNECT flatai.org:443 HTTP/1.1\r\nHost: flatai.org:443\r\n\r\n',
  );
  assert.match(response, /^HTTP\/1\.1 403 /);
  assert.equal(dials, 0);
  await close(proxy);
});

test('bounds an unfinished upstream connection and destroys its socket', async () => {
  const upstream = new net.Socket();
  const proxy = createEgressProxy({
    resolver: async () => [{ address: '8.8.8.8', family: 4 }],
    dial: () => upstream,
    connectTimeoutMs: 10,
  });
  await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
  const response = await rawRequest(
    proxy.address().port,
    'CONNECT flatai.org:443 HTTP/1.1\r\nHost: flatai.org:443\r\n\r\n',
  );
  assert.match(response, /^HTTP\/1\.1 502 /);
  assert.equal(upstream.destroyed, true);
  await close(proxy);
});

test('pins a successful tunnel to the resolver-returned address', async () => {
  const target = net.createServer((socket) => socket.pipe(socket));
  await new Promise((resolve) => target.listen(0, '127.0.0.1', resolve));
  const targetPort = target.address().port;
  let dialed;
  const proxy = createEgressProxy({
    resolver: async () => [{ address: '8.8.8.8', family: 4 }],
    dial: (address, port) => {
      dialed = { address, port };
      return net.createConnection({ host: '127.0.0.1', port: targetPort });
    },
  });
  await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
  const proxyPort = proxy.address().port;
  const socket = net.createConnection({ host: '127.0.0.1', port: proxyPort });
  const data = await new Promise((resolve, reject) => {
    let received = '';
    socket.setTimeout(2000, () => reject(new Error('timeout')));
    socket.on('data', (chunk) => {
      received += chunk;
      if (received.includes('\r\n\r\n')) {
        assert.match(received, /^HTTP\/1\.1 200 /);
        socket.write('ping');
      }
      if (received.endsWith('ping')) resolve(received);
    });
    socket.on('error', reject);
    socket.write('CONNECT flatai.org:443 HTTP/1.1\r\nHost: flatai.org:443\r\n\r\n');
  });
  assert.match(data, /ping$/);
  assert.deepEqual(dialed, { address: '8.8.8.8', port: 443 });
  socket.destroy();
  await close(proxy);
  await close(target);
});

test('tears down the upstream socket when the browser closes its tunnel', async () => {
  let upstreamClosed = false;
  const target = net.createServer((socket) => socket.on('close', () => (upstreamClosed = true)));
  await new Promise((resolve) => target.listen(0, '127.0.0.1', resolve));
  const targetPort = target.address().port;
  const proxy = createEgressProxy({
    resolver: async () => [{ address: '8.8.8.8', family: 4 }],
    dial: () => net.createConnection({ host: '127.0.0.1', port: targetPort }),
  });
  await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
  const socket = net.createConnection({ host: '127.0.0.1', port: proxy.address().port });
  await new Promise((resolve, reject) => {
    let response = '';
    socket.on('data', (chunk) => {
      response += chunk;
      if (response.includes('\r\n\r\n')) resolve();
    });
    socket.on('error', reject);
    socket.write('CONNECT flatai.org:443 HTTP/1.1\r\nHost: flatai.org:443\r\n\r\n');
  });
  socket.destroy();
  await waitFor(() => upstreamClosed);
  await close(proxy);
  await close(target);
});

function rawRequest(port, request) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    let response = '';
    socket.on('data', (chunk) => {
      response += chunk;
    });
    socket.on('end', () => resolve(response));
    socket.on('error', reject);
    socket.write(request);
  });
}

function close(server) {
  return new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

async function waitFor(predicate, timeoutMs = 500) {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error('timeout');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
