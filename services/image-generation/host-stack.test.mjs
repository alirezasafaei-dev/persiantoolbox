import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('systemd startup timeout covers sequential drain, health waits and verification overhead', async () => {
  const script = await readFile(new URL('./host-stack.sh', import.meta.url), 'utf8');
  const unit = await readFile(new URL('./pt-image-stack.service', import.meta.url), 'utf8');
  const drain = [...script.matchAll(/compose stop -t (\d+)/g)].reduce(
    (sum, match) => sum + Number(match[1]),
    0,
  );
  const waits = [...script.matchAll(/^wait_healthy image-/gm)].length;
  const attempts = Number(script.match(/attempt" -lt (\d+)/)?.[1]);
  const timeout = Number(unit.match(/^TimeoutStartSec=(\d+)/m)?.[1]);
  assert.ok(
    timeout > drain + waits * attempts + 60,
    'unit must allow all bounded phases plus command overhead',
  );
  assert.ok(script.includes("trap 'exit 1' HUP INT TERM"));
});

test(
  'Linux stack contains Compose failures and validates readiness before startup',
  { skip: process.platform !== 'linux' },
  async () => {
    const dir = await mkdtemp(join(tmpdir(), 'pt-image-stack-test-'));
    try {
      const executable = async (name, body) =>
        writeFile(join(dir, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
      await executable('id', 'echo 0');
      await executable('node', 'echo network-check >> "$TEST_DIR/trace"');
      await executable('guard', 'echo "guard $*" >> "$TEST_DIR/trace"');
      await executable('ufw', 'echo reload >> "$TEST_DIR/trace"; [ "$TEST_MODE" != reload-fail ]');
      await executable(
        'docker',
        `echo "$*" >> "$TEST_DIR/trace"
case "$*" in
  "ps -q --filter label=pt.image-generation.role=provider-browser") [ ! -e "$TEST_DIR/running" ] || echo test-browser ;;
  "update --restart=no test-browser") : ;;
  "stop -t 0 test-browser") rm -f "$TEST_DIR/running" ;;
  compose*)
    [ "$TEST_MODE" != compose-fail ] || exit 2
    case "$*" in
      *"stop -t 0 image-browser") rm -f "$TEST_DIR/running" ;;
      *"start image-browser") touch "$TEST_DIR/running" ;;
      *"ps -a -q"*) echo test-service ;;
    esac ;;
  inspect*) echo healthy ;;
  *) exit 3 ;;
esac`,
      );
      const source = (await readFile(new URL('./host-stack.sh', import.meta.url), 'utf8'))
        .replaceAll('\r', '')
        .replace('/opt/persiantoolbox-image', dir)
        .replace('/run/lock/pt-image-stack.lock', join(dir, 'lock'))
        .replaceAll('/usr/local/libexec/pt-image-host-guard.sh', join(dir, 'guard'));
      const script = join(dir, 'stack.sh');
      await writeFile(script, source);
      const run = (mode) =>
        spawnSync('/bin/sh', [script, mode === 'reload-fail' ? 'reload-ufw' : 'start'], {
          env: {
            ...process.env,
            PATH: `${dir}:${process.env.PATH}`,
            TEST_DIR: dir,
            TEST_MODE: mode,
          },
          encoding: 'utf8',
          timeout: 5000,
        });
      let result = run('success');
      assert.equal(result.status, 0, result.stderr);
      let trace = await readFile(join(dir, 'trace'), 'utf8');
      assert.ok(trace.indexOf('network-check') < trace.indexOf('start image-browser'));
      assert.ok(trace.indexOf('inspect --format') < trace.indexOf('start image-worker'));
      for (const mode of ['compose-fail', 'reload-fail']) {
        await writeFile(join(dir, 'running'), '1');
        await writeFile(join(dir, 'trace'), '');
        result = run(mode);
        assert.notEqual(result.status, 0);
        trace = await readFile(join(dir, 'trace'), 'utf8');
        assert.ok(trace.includes('ps -q --filter label=pt.image-generation.role=provider-browser'));
        await assert.rejects(readFile(join(dir, 'running')), { code: 'ENOENT' });
        if (mode === 'compose-fail') assert.ok(trace.includes('update --restart=no test-browser'));
        else assert.ok(trace.indexOf('stop -t 0 image-browser') < trace.indexOf('reload'));
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
);
