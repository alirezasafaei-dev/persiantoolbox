import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/deployment-readiness-gates.json');
const parsed = JSON.parse(readFileSync(filePath, 'utf8'));

if (parsed.version !== 1) {
  throw new Error('Invalid deployment readiness contract version');
}

const requiredRootFields = [
  'requiredEnv',
  'securityGates',
  'pwaGates',
  'qualityGates',
  'releaseGates',
];
for (const field of requiredRootFields) {
  if (!(field in parsed)) {
    throw new Error(`Missing root field: ${field}`);
  }
}

const baselineRequiredProdEnv = new Set(['NEXT_PUBLIC_SITE_URL']);

if (!parsed.requiredEnv || typeof parsed.requiredEnv !== 'object') {
  throw new Error('requiredEnv must be object');
}
if (!Array.isArray(parsed.requiredEnv.production) || parsed.requiredEnv.production.length === 0) {
  throw new Error('requiredEnv.production must be non-empty array');
}
const duplicateProdEnv = parsed.requiredEnv.production.filter(
  (value, index, array) => array.indexOf(value) !== index
);
if (duplicateProdEnv.length > 0) {
  throw new Error(`Duplicate required production env keys: ${duplicateProdEnv.join(', ')}`);
}

for (const envKey of baselineRequiredProdEnv) {
  if (!parsed.requiredEnv.production.includes(envKey)) {
    throw new Error(`Missing required production env: ${envKey}`);
  }
}

for (const section of ['securityGates', 'pwaGates', 'releaseGates']) {
  if (!Array.isArray(parsed[section]) || parsed[section].length === 0) {
    throw new Error(`${section} must be a non-empty array`);
  }
}

if (!Array.isArray(parsed.qualityGates) || parsed.qualityGates.length === 0) {
  throw new Error('qualityGates must be a non-empty array');
}

const requiredGateIds = new Set(['quality_ci_quick', 'quality_build', 'quality_sw_contract']);
const seenIds = new Set();
let hasExtended = false;
for (const gate of parsed.qualityGates) {
  const fields = ['id', 'command', 'tier', 'blocking'];
  for (const field of fields) {
    if (!(field in gate)) {
      throw new Error(`Missing quality gate field '${field}' in ${gate.id ?? 'unknown'}`);
    }
  }

  if (typeof gate.id !== 'string' || gate.id.trim().length < 3) {
    throw new Error('Invalid quality gate id');
  }
  if (seenIds.has(gate.id)) {
    throw new Error(`Duplicate quality gate id: ${gate.id}`);
  }
  seenIds.add(gate.id);

  if (typeof gate.command !== 'string' || !gate.command.startsWith('pnpm ')) {
    throw new Error(`Invalid command for gate ${gate.id}`);
  }
  if (gate.tier !== 'core' && gate.tier !== 'extended') {
    throw new Error(`Invalid tier for gate ${gate.id}`);
  }
  if (gate.tier === 'extended') {
    hasExtended = true;
  }
  if (typeof gate.blocking !== 'boolean') {
    throw new Error(`blocking must be boolean for gate ${gate.id}`);
  }
}

for (const gateId of requiredGateIds) {
  if (!seenIds.has(gateId)) {
    throw new Error(`Missing required quality gate id: ${gateId}`);
  }
}
if (!hasExtended) {
  throw new Error('At least one extended quality gate is required');
}

console.log(
  `[deploy] readiness gates contract valid (${parsed.qualityGates.length} quality gates, ${parsed.securityGates.length} security gates)`
);
