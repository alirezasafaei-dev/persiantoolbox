import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/launch-day-checklist.json');
const parsed = JSON.parse(readFileSync(filePath, 'utf8'));

if (parsed.version !== 1) {
  throw new Error('Invalid launch day checklist version');
}

for (const field of ['launchReadiness', 'smokeSuites', 'launchOutputs']) {
  if (!Array.isArray(parsed[field]) || parsed[field].length === 0) {
    throw new Error(`${field} must be a non-empty array`);
  }
}

const seenSuiteIds = new Set();
let hasExtended = false;
let coreSuiteCount = 0;

for (const suite of parsed.smokeSuites) {
  for (const field of ['id', 'command', 'tier', 'blocking']) {
    if (!(field in suite)) {
      throw new Error(`Missing smoke suite field '${field}' in ${suite.id ?? 'unknown'}`);
    }
  }

  if (typeof suite.id !== 'string' || suite.id.trim().length < 3) {
    throw new Error('Invalid smoke suite id');
  }
  if (seenSuiteIds.has(suite.id)) {
    throw new Error(`Duplicate smoke suite id: ${suite.id}`);
  }
  seenSuiteIds.add(suite.id);

  if (typeof suite.command !== 'string' || !/(^|\s)pnpm\s/.test(suite.command)) {
    throw new Error(`Invalid command format for smoke suite ${suite.id}`);
  }

  if (!['core', 'extended'].includes(suite.tier)) {
    throw new Error(`Invalid tier for smoke suite ${suite.id}`);
  }

  if (suite.tier === 'core') {
    coreSuiteCount += 1;
  }
  if (suite.tier === 'extended') {
    hasExtended = true;
  }

  if (typeof suite.blocking !== 'boolean') {
    throw new Error(`Invalid blocking flag for smoke suite ${suite.id}`);
  }
}

if (coreSuiteCount === 0) {
  throw new Error('At least one core launch smoke suite is required');
}
if (!hasExtended) {
  throw new Error('At least one extended launch smoke suite is required');
}

console.log(`[release] launch day checklist contract valid (${parsed.smokeSuites.length} smoke suites)`);
