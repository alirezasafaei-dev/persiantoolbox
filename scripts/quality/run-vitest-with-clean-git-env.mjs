import { spawnSync } from 'node:child_process';

const env = { ...process.env };
delete env.GIT_INDEX_FILE;

const result = spawnSync('pnpm', ['exec', 'vitest', ...process.argv.slice(2)], {
  env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
