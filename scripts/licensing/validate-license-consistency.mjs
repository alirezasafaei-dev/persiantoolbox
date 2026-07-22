import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const policy = readFileSync(resolve(root, 'docs/licensing/dual-license-policy.md'), 'utf8');
const operations = readFileSync(resolve(root, 'docs/licensing/cla-operations.md'), 'utf8');

const assertions = [
  {
    id: 'policy_hybrid_governance',
    valid:
      policy.includes('DCO + CLA Hybrid') &&
      policy.includes('cla-individual.md') &&
      policy.includes('cla-corporate.md'),
    message: 'dual-license policy must include DCO + CLA hybrid references',
  },
  {
    id: 'cla_operations_reference_id',
    valid: operations.includes('CLA-<YEAR>-<TYPE>-<SEQ>') && operations.includes('referenceId'),
    message: 'CLA operations runbook must define reference ID and audit metadata',
  },
  {
    id: 'license_is_apache2',
    valid: readFileSync(resolve(root, 'LICENSE'), 'utf8').includes('Apache License'),
    message: 'LICENSE must be Apache License 2.0',
  },
];

const failed = assertions.filter((item) => !item.valid);
if (failed.length > 0) {
  throw new Error(
    `[licensing] consistency checks failed: ${failed.map((f) => `${f.id}: ${f.message}`).join('; ')}`,
  );
}

console.log(`[licensing] consistency checks passed (${assertions.length} assertions)`);
