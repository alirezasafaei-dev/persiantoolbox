import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const taskboard = readFileSync(resolve(root, 'docs/licensing/license-migration-taskboard.md'), 'utf8');
const policy = readFileSync(resolve(root, 'docs/licensing/dual-license-policy.md'), 'utf8');
const releaseChecklist = readFileSync(resolve(root, 'docs/licensing/v2-license-release-checklist.md'), 'utf8');
const operations = readFileSync(resolve(root, 'docs/licensing/cla-operations.md'), 'utf8');

const assertions = [
  {
    id: 'taskboard_priority3_complete',
    valid: taskboard.includes('Priority 3') && taskboard.includes('- [x] تعریف CLA سبک Individual/Corporate'),
    message: 'taskboard must mark Priority 3 CLA/release readiness as complete',
  },
  {
    id: 'policy_hybrid_governance',
    valid: policy.includes('DCO + CLA Hybrid') && policy.includes('cla-individual.md') && policy.includes('cla-corporate.md'),
    message: 'dual-license policy must include DCO + CLA hybrid references',
  },
  {
    id: 'release_checklist_core_steps',
    valid:
      releaseChecklist.includes('package.json#license') &&
      releaseChecklist.includes('SEE LICENSE IN LICENSE') &&
      releaseChecklist.includes('v1.1.x') &&
      releaseChecklist.includes('dual-licensed'),
    message: 'v2 release checklist must include package/license boundary steps',
  },
  {
    id: 'cla_operations_reference_id',
    valid: operations.includes('CLA-<YEAR>-<TYPE>-<SEQ>') && operations.includes('referenceId'),
    message: 'CLA operations runbook must define reference ID and audit metadata',
  },
];

const failed = assertions.filter((item) => !item.valid);
if (failed.length > 0) {
  throw new Error(`[licensing] consistency checks failed: ${failed.map((f) => `${f.id}: ${f.message}`).join('; ')}`);
}

console.log(`[licensing] consistency checks passed (${assertions.length} assertions)`);
