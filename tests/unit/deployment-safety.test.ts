import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

const shellScripts = [
  'deploy-blue-green.sh',
  'deploy-vps-auto.sh',
  'auto-deploy.sh',
  'deploy-interactive.sh',
  'ops/deploy/deploy.sh',
  'ops/deploy/deploy-production-blue-green.sh',
  'ops/deploy/rollback.sh',
  'scripts/deploy/post-deploy-verify.sh',
  'scripts/deploy/provision-static-asset-store.sh',
  'scripts/deploy/verify-release-assets.sh',
];

describe('production deployment safety contracts', () => {
  it.each(shellScripts)('keeps %s syntactically valid', (path) => {
    expect(() => execFileSync('bash', ['-n', path], { stdio: 'pipe' })).not.toThrow();
  });

  it('routes every production deployment through the canonical blue-green engine', () => {
    const manual = source('deploy-blue-green.sh');
    const generic = source('ops/deploy/deploy.sh');
    const workflow = source('.github/workflows/deploy-production.yml');

    expect(manual).toContain('PRODUCTION_DEPLOY_SHA');
    expect(manual).toContain('deploy-production-blue-green.sh');
    expect(generic).toContain('if [[ "$ENVIRONMENT" == "production" ]]');
    expect(generic).toContain('exec "$PROD_SCRIPT"');
    expect(workflow).toContain('Atomic blue-green deploy on VPS');
    expect(workflow).toContain('deploy-production-blue-green.sh');
    expect(workflow).not.toContain("LOCAL_BASE='http://127.0.0.1:3000'");
  });

  it('retires every legacy in-place production entrypoint', () => {
    for (const path of ['deploy-vps-auto.sh', 'auto-deploy.sh', 'deploy-interactive.sh']) {
      const script = source(path);
      expect(script).toContain('deploy-blue-green.sh');
      expect(script).not.toContain('pm2 delete');
      expect(script).not.toContain('StrictHostKeyChecking=no');
    }

    expect(source('deploy.py')).toContain('deploy-blue-green.sh');
    expect(source('scripts/automation/automation/deploy.py')).toContain('deploy-blue-green.sh');
  });

  it('refuses production traffic switching until static routing is release-safe', () => {
    const deploy = source('ops/deploy/deploy-production-blue-green.sh');
    const provision = source('scripts/deploy/provision-static-asset-store.sh');

    expect(deploy).toContain('/etc/nginx/.persiantoolbox-static-safe');
    expect(deploy).toContain('persiantoolbox-shared-assets');
    expect(deploy).toContain(
      'sudo rsync -a "$RELEASE_DIR/.next/standalone/.next/static/" "$STATIC_STORE/"',
    );
    expect(deploy).not.toContain(
      'rsync -a --delete "$RELEASE_DIR/.next/standalone/.next/static/"',
    );
    expect(provision).toContain('alias $STATIC_STORE/;');
    expect(provision).toContain('persiantoolbox-static-safe');
    expect(provision).toContain('restore_nginx');
    expect(provision).toContain('readlink -f "$file"');
  });

  it('verifies the candidate before switching and the public release twice after switching', () => {
    const deploy = source('ops/deploy/deploy-production-blue-green.sh');
    const verifier = source('scripts/deploy/verify-release-assets.sh');

    expect(deploy).toContain('http://127.0.0.1:$NEW_PORT');
    expect(deploy).toContain('bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" "$BASE_URL"');
    expect(deploy).toContain('sleep 5');
    expect(verifier).toContain('CSS_COUNT');
    expect(verifier).toContain('JS_COUNT');
    expect(verifier).toContain('content_type');
    expect(verifier).toContain('PAGES=("/" "/blog" "/pricing" "/tools" "/salary")');
  });

  it('allows recovery only as an explicit current-release health exception', () => {
    const manual = source('deploy-blue-green.sh');
    const deploy = source('ops/deploy/deploy-production-blue-green.sh');
    const workflow = source('.github/workflows/deploy-production.yml');
    const verifier = source('scripts/deploy/verify-release-assets.sh');

    expect(manual).toContain('ALLOW_RECOVERY_DEPLOY');
    expect(workflow).toContain('allow_recovery_deploy');
    expect(workflow).toContain("default: 'false'");
    expect(deploy).toContain('CURRENT_VERIFY_HEALTH=false');
    expect(deploy).toContain('candidate did not become healthy');
    expect(verifier).toContain('VERIFY_HEALTH="${VERIFY_HEALTH:-true}"');
    expect(deploy).not.toContain('VERIFY_HEALTH=false bash "$RELEASE_DIR');
  });

  it('rolls back every post-switch failure and retains the previous slot', () => {
    const deploy = source('ops/deploy/deploy-production-blue-green.sh');
    const rollback = source('ops/deploy/rollback.sh');
    const workflow = source('.github/workflows/deploy-production.yml');

    expect(deploy).toContain('trap on_error ERR INT TERM');
    expect(deploy).toContain('sudo install -m 644 "$UPSTREAM_BACKUP" "$UPSTREAM_FILE"');
    expect(deploy).toContain('Keep both slots running');
    expect(deploy).not.toContain('pm2 delete "$CURRENT_PROCESS"');
    expect(rollback).toContain('production-current.env');
    expect(rollback).toContain('PREVIOUS_PORT');
    expect(rollback).not.toContain('pm2 delete "$APP_NAME"');
    expect(workflow).toContain('Roll back to recorded previous slot on any post-switch failure');
  });

  it('keeps release identity and active port in a protected state file', () => {
    const deploy = source('ops/deploy/deploy-production-blue-green.sh');
    const workflow = source('.github/workflows/deploy-production.yml');

    expect(deploy).toContain('SOURCE_GIT_SHA must be the exact 40-character release SHA');
    expect(deploy).toContain('production-current.env');
    expect(deploy).toContain('ACTIVE_PORT=$NEW_PORT');
    expect(workflow).toContain('production-current.env');
    expect(workflow).toContain('ACTIVE_PORT');
    expect(workflow).toContain('steps.meta.outputs.release_sha');
  });

  it('treats Redis as optional unless REDIS_REQUIRED is explicitly true', () => {
    const health = source('app/api/health/route.ts');
    const readiness = source('app/api/ready/route.ts');

    for (const route of [health, readiness]) {
      expect(route).toContain("process.env['REDIS_REQUIRED'] === 'true'");
      expect(route).toContain('ok: !required');
      expect(route).toContain('using no-cache fallback');
    }
  });
});
