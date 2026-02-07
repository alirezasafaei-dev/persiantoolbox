import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/monetization/operations-checklist.json');
const parsed = JSON.parse(readFileSync(filePath, 'utf8'));

const requiredDecisionGates = new Set(['scale', 'hold', 'rollback']);
const requiredRoles = new Set(['engineering_lead', 'quality_engineer', 'ux_accessibility']);
const requiredRuleDecisions = new Set(['scale', 'hold', 'rollback']);

if (parsed.version !== 1) {
  throw new Error('Invalid operations checklist version');
}
if (!Array.isArray(parsed.monthlyClose) || parsed.monthlyClose.length === 0) {
  throw new Error('monthlyClose must be a non-empty array');
}
if (!Array.isArray(parsed.quarterlyReview) || parsed.quarterlyReview.length === 0) {
  throw new Error('quarterlyReview must be a non-empty array');
}
if (!Array.isArray(parsed.decisionRules) || parsed.decisionRules.length !== 3) {
  throw new Error('decisionRules must include scale/hold/rollback');
}

const validateRow = (row, idPrefix) => {
  const requiredFields = [
    'id',
    'title',
    'requiredArtifacts',
    'requiredChecks',
    'ownerRole',
    'decisionGate',
  ];
  for (const field of requiredFields) {
    if (!(field in row)) {
      throw new Error(`Missing field '${field}' in ${row.id ?? idPrefix}`);
    }
  }

  if (typeof row.id !== 'string' || !row.id.startsWith(idPrefix)) {
    throw new Error(`Invalid id format: ${row.id}`);
  }
  if (typeof row.title !== 'string' || row.title.trim().length < 8) {
    throw new Error(`Invalid title: ${row.id}`);
  }
  if (!Array.isArray(row.requiredArtifacts) || row.requiredArtifacts.length === 0) {
    throw new Error(`requiredArtifacts must be non-empty: ${row.id}`);
  }
  if (!Array.isArray(row.requiredChecks) || row.requiredChecks.length === 0) {
    throw new Error(`requiredChecks must be non-empty: ${row.id}`);
  }
  if (!requiredRoles.has(row.ownerRole)) {
    throw new Error(`Invalid ownerRole '${row.ownerRole}' in ${row.id}`);
  }
  if (!requiredDecisionGates.has(row.decisionGate)) {
    throw new Error(`Invalid decisionGate '${row.decisionGate}' in ${row.id}`);
  }
};

for (const row of parsed.monthlyClose) {
  validateRow(row, 'MON-OPS-');
}
for (const row of parsed.quarterlyReview) {
  validateRow(row, 'MON-QTR-');
}

const seenDecisions = new Set();
for (const rule of parsed.decisionRules) {
  if (!requiredRuleDecisions.has(rule.decision)) {
    throw new Error(`Invalid rule decision: ${rule.decision}`);
  }
  if (seenDecisions.has(rule.decision)) {
    throw new Error(`Duplicate rule decision: ${rule.decision}`);
  }
  seenDecisions.add(rule.decision);

  if (!Array.isArray(rule.requires) || rule.requires.length === 0) {
    throw new Error(`requires must be non-empty for ${rule.decision}`);
  }
  if (!Array.isArray(rule.blocks)) {
    throw new Error(`blocks must be array for ${rule.decision}`);
  }
}

console.log(
  `[monetization] operations checklist contract valid (${parsed.monthlyClose.length} monthly, ${parsed.quarterlyReview.length} quarterly)`
);
