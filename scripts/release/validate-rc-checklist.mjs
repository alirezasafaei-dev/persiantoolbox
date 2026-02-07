import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/release-candidate-checklist.json');
const parsed = JSON.parse(readFileSync(filePath, 'utf8'));

if (parsed.version !== 1) {
  throw new Error('Invalid release candidate checklist version');
}

for (const field of ['envGates', 'securityGates', 'qualityGates', 'releaseOutputs']) {
  if (!Array.isArray(parsed[field]) || parsed[field].length === 0) {
    throw new Error(`${field} must be a non-empty array`);
  }
}

const requiredGateIds = new Set(['rc_deploy_contract', 'rc_deploy_core_run', 'rc_ci_quick', 'rc_build']);
const seenGateIds = new Set();
let hasExtended = false;

for (const gate of parsed.qualityGates) {
  for (const field of ['id', 'command', 'tier', 'blocking']) {
    if (!(field in gate)) {
      throw new Error(`Missing quality gate field '${field}' in ${gate.id ?? 'unknown'}`);
    }
  }

  if (typeof gate.id !== 'string' || gate.id.trim().length < 3) {
    throw new Error('Invalid quality gate id');
  }
  if (seenGateIds.has(gate.id)) {
    throw new Error(`Duplicate quality gate id: ${gate.id}`);
  }
  seenGateIds.add(gate.id);

  if (typeof gate.command !== 'string' || !gate.command.startsWith('pnpm ')) {
    throw new Error(`Invalid command format for gate ${gate.id}`);
  }
  if (!['core', 'extended'].includes(gate.tier)) {
    throw new Error(`Invalid tier for gate ${gate.id}`);
  }
  if (gate.tier === 'extended') {
    hasExtended = true;
  }
  if (typeof gate.blocking !== 'boolean') {
    throw new Error(`Invalid blocking flag for gate ${gate.id}`);
  }
}

for (const requiredId of requiredGateIds) {
  if (!seenGateIds.has(requiredId)) {
    throw new Error(`Missing required quality gate id: ${requiredId}`);
  }
}
if (!hasExtended) {
  throw new Error('At least one extended RC gate is required');
}

console.log(`[release] rc checklist contract valid (${parsed.qualityGates.length} quality gates)`);
