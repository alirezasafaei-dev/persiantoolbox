import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
const exec = promisify(execFile);

export function validateHostNetworks({ version, networks, attachments, restart, liveRestore }) {
  const fail = () => {
    throw new Error('Browser host isolation verification failed');
  };
  if (
    !/^\d+\.\d+\.\d+/.test(version) ||
    Number(version.split('.')[0]) < 28 ||
    networks.length !== 2 ||
    attachments.length !== 2 ||
    restart !== 'no' ||
    liveRestore !== false
  )
    fail();
  const bridges = new Set();
  for (const network of networks) {
    const options = network.Options ?? {};
    bridges.add(options['com.docker.network.bridge.name']);
    if (
      network.Driver !== 'bridge' ||
      network.Internal !== true ||
      network.EnableIPv6 !== false ||
      options['com.docker.network.bridge.gateway_mode_ipv4'] !== 'isolated' ||
      options['com.docker.network.bridge.gateway_mode_ipv6'] !== 'isolated' ||
      !attachments.includes(network.Name) ||
      network.addresses.length !== 0
    )
      fail();
  }
  if (bridges.size !== 2 || !bridges.has('ptimg-control') || !bridges.has('ptimg-egress')) fail();
}

async function command(file, args) {
  const { stdout } = await exec(file, args, { timeout: 10000, maxBuffer: 16384 });
  return stdout.trim();
}
async function check() {
  if (process.getuid?.() !== 0) throw new Error('Root required');
  const version = await command('docker', ['version', '--format', '{{.Server.Version}}']);
  const liveRestore = JSON.parse(
    await command('docker', ['info', '--format', '{{json .LiveRestoreEnabled}}']),
  );
  const ids = await command('docker', [
    'compose',
    '-p',
    'pt-image-production',
    'ps',
    '-a',
    '-q',
    'image-browser',
  ]);
  if (!/^[a-f0-9]{64}$/.test(ids)) throw new Error('Expected one browser');
  // Never inspect/export the protected container environment.
  const attachments = Object.keys(
    JSON.parse(
      await command('docker', ['inspect', '--format', '{{json .NetworkSettings.Networks}}', ids]),
    ),
  );
  const restart = await command('docker', [
    'inspect',
    '--format',
    '{{.HostConfig.RestartPolicy.Name}}',
    ids,
  ]);
  const networks = [];
  for (const name of attachments) {
    const [network] = JSON.parse(await command('docker', ['network', 'inspect', name]));
    const bridge = network.Options?.['com.docker.network.bridge.name'];
    if (!['ptimg-control', 'ptimg-egress'].includes(bridge)) throw new Error('Unexpected bridge');
    const interfaces = JSON.parse(await command('ip', ['-j', 'address', 'show', 'dev', bridge]));
    network.addresses = interfaces.flatMap((value) => value.addr_info ?? []);
    networks.push(network);
  }
  validateHostNetworks({ version, networks, attachments, restart, liveRestore });
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  check()
    .then(() => console.log('Browser host isolation verified'))
    .catch(() => {
      console.error('Browser host isolation verification failed');
      process.exitCode = 1;
    });
}
