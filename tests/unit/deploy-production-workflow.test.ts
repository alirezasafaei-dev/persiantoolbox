import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function workflowSource(): string {
  return readFileSync(
    resolve(process.cwd(), '.github/workflows/deploy-production.yml'),
    'utf8',
  );
}

describe('production deployment workflow contract', () => {
  it('exposes the one-time legacy cache bootstrap as a fail-default input', () => {
    const source = workflowSource();

    expect(source).toContain('allow_legacy_cache_bootstrap:');
    expect(source).toContain(
      'description: One-time migration only; skip current legacy cache headers before switching',
    );
    expect(source).toMatch(
      /allow_legacy_cache_bootstrap:[\s\S]*?default: 'false'[\s\S]*?options: \['false', 'true'\]/,
    );
  });

  it('passes the dispatch input to the canonical wrapper environment', () => {
    const source = workflowSource();

    expect(source).toContain(
      "ALLOW_LEGACY_CACHE_BOOTSTRAP: ${{ github.event.inputs.allow_legacy_cache_bootstrap || 'false' }}",
    );
    expect(source).toContain('bash deploy-blue-green.sh');
    expect(source).toContain(
      'DEPLOY_BASE_DIR: /home/ubuntu/persiantoolbox-blue-green',
    );
    expect(source).toContain(
      "CURRENT_PRODUCTION_SHA: ${{ github.event.inputs.current_production_sha || '' }}",
    );
  });

  it('keeps migration and recovery controls independent and disabled by default', () => {
    const source = workflowSource();

    expect(source).toMatch(
      /allow_recovery_deploy:[\s\S]*?default: 'false'[\s\S]*?allow_legacy_cache_bootstrap:/,
    );
    expect(source).toContain(
      "ALLOW_RECOVERY_DEPLOY: ${{ github.event.inputs.allow_recovery_deploy || 'false' }}",
    );
    expect(source).toContain(
      "RUN_MIGRATIONS: ${{ github.event.inputs.run_migrations || 'false' }}",
    );
  });
});
