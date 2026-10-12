import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateHostNetworks, prepareHostNetworks } from './host-network-check.mjs';

function valid() {
  const networks = ['ptimg-control', 'ptimg-egress'].map((bridge, i) => ({
    Name: `stack-network-${i}`,
    Driver: 'bridge',
    Internal: true,
    EnableIPv6: false,
    Options: {
      'com.docker.network.bridge.name': bridge,
      'com.docker.network.bridge.gateway_mode_ipv4': 'isolated',
      'com.docker.network.bridge.gateway_mode_ipv6': 'isolated',
    },
    addresses: [],
  }));
  return {
    version: '29.1.3',
    networks,
    attachments: networks.map((n) => n.Name),
    restart: 'no',
    liveRestore: false,
  };
}
test('host validator accepts only gatewayless isolated browser networks', () => {
  assert.doesNotThrow(() => validateHostNetworks(valid()));
  for (const mutate of [
    (v) => (v.version = '27.5.1'),
    (v) => (v.networks[0].Internal = false),
    (v) => (v.networks[0].EnableIPv6 = true),
    (v) => delete v.networks[0].Options['com.docker.network.bridge.gateway_mode_ipv4'],
    (v) => (v.networks[0].Options['com.docker.network.bridge.gateway_mode_ipv6'] = 'nat'),
    (v) => (v.networks[0].addresses = [{ family: 'inet', local: '172.20.0.1' }]),
    (v) => (v.networks[1].addresses = [{ family: 'inet6', local: 'fe80::1' }]),
    (v) => v.attachments.push('database'),
    (v) => (v.restart = 'on-failure'),
    (v) => (v.liveRestore = true),
  ]) {
    const input = valid();
    mutate(input);
    assert.throws(() => validateHostNetworks(input), /isolation/);
  }
});

test('preparation disables automatic link-local addresses only on validated owned bridges', async () => {
  const input = valid();
  input.networks[0].addresses = [
    { family: 'inet6', local: 'fe80::1', scope: 'link', prefixlen: 64 },
  ];
  const calls = [];
  await prepareHostNetworks(input, async (file, args) => calls.push([file, args]));
  assert.deepEqual(
    calls,
    ['ptimg-control', 'ptimg-egress'].flatMap((bridge) => [
      ['ip', ['link', 'set', 'dev', bridge, 'addrgenmode', 'none']],
      ['ip', ['-6', 'address', 'flush', 'dev', bridge, 'scope', 'link']],
    ]),
  );
  assert.throws(() => validateHostNetworks(input), /isolation/);
});

test('preparation refuses unexpected topology or non-link-local addresses before any mutation', async () => {
  for (const mutate of [
    (v) => (v.networks[0].Internal = false),
    (v) => (v.networks[0].addresses = [{ family: 'inet', local: '172.20.0.1' }]),
    (v) =>
      (v.networks[0].addresses = [
        { family: 'inet6', local: '2001:db8::1', scope: 'global', prefixlen: 64 },
      ]),
    (v) =>
      (v.networks[1].addresses = [
        { family: 'inet6', local: 'fe80::1', scope: 'global', prefixlen: 64 },
      ]),
    (v) => (v.networks[1].Options['com.docker.network.bridge.name'] = 'docker0'),
    (v) => (v.liveRestore = true),
  ]) {
    const input = valid();
    mutate(input);
    const calls = [];
    await assert.rejects(
      prepareHostNetworks(input, async (...args) => calls.push(args)),
      /isolation/,
    );
    assert.equal(calls.length, 0);
  }
});

test('preparation command failures propagate without changing remaining bridges', async () => {
  const calls = [];
  await assert.rejects(
    prepareHostNetworks(valid(), async (file, args) => {
      calls.push([file, args]);
      throw new Error('command failed');
    }),
    /command failed/,
  );
  assert.equal(calls.length, 1);
});
