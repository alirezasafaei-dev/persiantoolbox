import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/rollback-drill-checklist.json');
const parsed = JSON.parse(readFileSync(filePath, 'utf8'));

if (parsed.version !== 1) {
  throw new Error('Invalid rollback drill contract version');
}
if (!Array.isArray(parsed.drills) || parsed.drills.length === 0) {
  throw new Error('drills must be a non-empty array');
}
if (!parsed.reporting || typeof parsed.reporting !== 'object') {
  throw new Error('reporting must be object');
}

const validRoles = new Set(['engineering_lead', 'quality_engineer', 'ux_accessibility']);
const ids = new Set();

for (const drill of parsed.drills) {
  for (const field of ['id', 'name', 'ownerRole', 'steps', 'successCriteria', 'evidenceRequired']) {
    if (!(field in drill)) {
      throw new Error(`Missing drill field '${field}'`);
    }
  }

  if (!/^RB-\d{3}$/.test(drill.id)) {
    throw new Error(`Invalid drill id: ${drill.id}`);
  }
  if (ids.has(drill.id)) {
    throw new Error(`Duplicate drill id: ${drill.id}`);
  }
  ids.add(drill.id);

  if (!validRoles.has(drill.ownerRole)) {
    throw new Error(`Invalid owner role in ${drill.id}`);
  }
  if (!Array.isArray(drill.steps) || drill.steps.length < 3) {
    throw new Error(`steps must have at least 3 items in ${drill.id}`);
  }
  if (!Array.isArray(drill.successCriteria) || drill.successCriteria.length < 2) {
    throw new Error(`successCriteria must have at least 2 items in ${drill.id}`);
  }
  if (drill.evidenceRequired !== true) {
    throw new Error(`evidenceRequired must be true in ${drill.id}`);
  }
}

if (!Array.isArray(parsed.reporting.required) || parsed.reporting.required.length === 0) {
  throw new Error('reporting.required must be non-empty');
}
if (!Array.isArray(parsed.reporting.allowedStatus) || parsed.reporting.allowedStatus.length === 0) {
  throw new Error('reporting.allowedStatus must be non-empty');
}

const statuses = new Set(parsed.reporting.allowedStatus);
for (const status of ['passed', 'failed', 'partial']) {
  if (!statuses.has(status)) {
    throw new Error(`Missing rollback report status: ${status}`);
  }
}

console.log(`[release] rollback drill contract valid (${parsed.drills.length} drills)`);
