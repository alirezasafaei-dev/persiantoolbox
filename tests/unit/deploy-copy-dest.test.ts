import { execFileSync } from 'node:child_process';
import { it } from 'vitest';
it('transfers only changed source bytes and preserves independent rollback files', () => {
  const command = 'python3 tests/integration/deploy-copy-dest.py';
  execFileSync(
    process.platform === 'win32' ? 'wsl.exe' : 'bash',
    process.platform === 'win32' ? ['--exec', 'bash', '-lc', command] : ['-lc', command],
    { timeout: 90000, stdio: 'pipe' },
  );
}, 95000);
