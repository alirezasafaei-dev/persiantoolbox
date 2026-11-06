import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  reconcileFontRouting,
  reconcileNginxDump,
} from '../../scripts/deploy/reconcile-font-routing.mjs';

const legacy = `server {
  listen 443 ssl;
  server_name persiantoolbox.ir www.persiantoolbox.ir;
  # A brace in a comment } must not end the server.
  add_header Example "value { preserved }";
  location /fonts/ {
    alias /home/ubuntu/persiantoolbox/.next/standalone/public/fonts/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }
  location / { proxy_pass http://persiantoolbox_backend; }
}
`;
const staging = legacy
  .replaceAll('persiantoolbox.ir', 'staging.persiantoolbox.ir')
  .replace('persiantoolbox/.next', 'persiantoolbox-staging/.next');

function runLinuxFixture(filename: string) {
  const command = `python3 tests/integration/${filename}`;
  // Git hooks prepend Git Bash on Windows; explicitly select WSL so its Python
  // and POSIX tools match the environment used by the deployment fixtures.
  const binary = process.platform === 'win32' ? 'wsl.exe' : 'bash';
  const args = process.platform === 'win32' ? ['--exec', 'bash', '-lc', command] : ['-lc', command];
  execFileSync(binary, args, { stdio: 'pipe', timeout: 90000 });
}

describe('production font route transform', () => {
  it('selects exactly the production file from a multi-file nginx inventory', () => {
    const dump = `# configuration file /etc/nginx/nginx.conf:\nhttp { include /etc/nginx/sites-enabled/*; }\n\n# configuration file /etc/nginx/sites-enabled/staging.conf:\n${staging}\n# configuration file /etc/nginx/sites-enabled/production.conf:\n${legacy}`;
    const selected = reconcileNginxDump(dump);
    if (!selected) throw new Error('Expected a selected production configuration');
    expect(selected.file).toBe('/etc/nginx/sites-enabled/production.conf');
    expect(selected.original).toBe(legacy);
    expect(selected.updated).toBe(reconcileFontRouting(legacy));
  });

  it('rejects duplicate or missing production files in the loaded inventory', () => {
    expect(() =>
      reconcileNginxDump(`# configuration file /etc/nginx/staging.conf:\n${staging}`),
    ).toThrow();
    expect(() =>
      reconcileNginxDump(
        `# configuration file /etc/nginx/a.conf:\n${legacy}\n# configuration file /etc/nginx/b.conf:\n${legacy}`,
      ),
    ).toThrow();
  });
  it('replaces only the production alias and preserves all other bytes', () => {
    const input = `${staging}\n${legacy}`;
    expect(reconcileFontRouting(input)).toBe(
      `${staging}\n${legacy.replace(
        'alias /home/ubuntu/persiantoolbox/.next/standalone/public/fonts/;',
        'proxy_pass http://persiantoolbox_backend;',
      )}`,
    );
  });

  it('is idempotent', () => {
    const repaired = reconcileFontRouting(legacy);
    expect(reconcileFontRouting(repaired)).toBe(repaired);
  });

  it.each([
    ['duplicate production block', legacy + legacy],
    ['unknown alias', legacy.replace('persiantoolbox/.next', 'other/.next')],
    [
      'unknown upstream',
      legacy.replace(
        'alias /home/ubuntu/persiantoolbox/.next/standalone/public/fonts/;',
        'proxy_pass http://other;',
      ),
    ],
    [
      'mixed production and staging names',
      legacy.replace('www.persiantoolbox.ir', 'staging.persiantoolbox.ir'),
    ],
    [
      'duplicate font location',
      legacy.replace('  location / {', '  location /fonts/ { alias /other/; }\n  location / {'),
    ],
    [
      'included font configuration',
      legacy.replace('    expires 1y;', '    include /unknown.conf;'),
    ],
    ['unclosed block', legacy.slice(0, -2)],
  ])('rejects %s before producing a configuration', (_label, input) => {
    expect(() => reconcileFontRouting(input)).toThrow();
  });

  it('rejects a staging-only configuration', () => {
    expect(() => reconcileFontRouting(staging)).toThrow();
  });
});

describe('invoice font deployment routing', () => {
  it('binds rollback and provisioning verification to the runtime being checked', () => {
    const rollback = readFileSync('ops/deploy/rollback.sh', 'utf8');
    expect(
      rollback.match(/FONT_REFERENCE_DIR="\$PREVIOUS_RELEASE\/\.next\/standalone\/public\/fonts"/g),
    ).toHaveLength(2);
    const provisioning = readFileSync('scripts/deploy/provision-static-asset-store.sh', 'utf8');
    expect(
      provisioning.match(
        /FONT_REFERENCE_DIR="\$CURRENT_APP_LINK\/\.next\/standalone\/public\/fonts"/g,
      ),
    ).toHaveLength(2);
  });
  it('atomically installs or restores nginx configuration on verification, syntax and reload failures', () => {
    runLinuxFixture('invoice-font-reconciliation.py');
  }, 95000);
  it('rejects missing, empty, corrupt and HTML font responses over real HTTP', () => {
    runLinuxFixture('invoice-font-verifier.py');
  }, 95000);
  it('checks both invoice TTF resources in the canonical public verifier', () => {
    const source = readFileSync('scripts/deploy/verify-release-assets.sh', 'utf8');
    expect(source).toContain('/fonts/Vazirmatn-Regular.ttf');
    expect(source).toContain('/fonts/Vazirmatn-Bold.ttf');
  });
});
