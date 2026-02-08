import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/monetization/site-settings-contract.json');
const parsed = JSON.parse(readFileSync(filePath, 'utf8'));

const requiredKeys = new Map([
  ['developer_name', { envFallback: 'DEVELOPER_NAME', type: 'text', nullable: false }],
  ['developer_brand_text', { envFallback: 'DEVELOPER_BRAND_TEXT', type: 'text', nullable: false }],
  ['order_url', { envFallback: 'ORDER_URL', type: 'url', nullable: true }],
  ['portfolio_url', { envFallback: 'PORTFOLIO_URL', type: 'url', nullable: true }],
]);

if (parsed.version !== 1 || !Array.isArray(parsed.keys)) {
  throw new Error('Invalid site-settings contract root');
}

const seen = new Set();
for (const row of parsed.keys) {
  const requiredFields = ['key', 'envFallback', 'type', 'nullable'];
  for (const field of requiredFields) {
    if (!(field in row)) {
      throw new Error(`Missing field '${field}' in site-settings contract`);
    }
  }

  if (!requiredKeys.has(row.key)) {
    throw new Error(`Unexpected key '${row.key}' in site-settings contract`);
  }
  if (seen.has(row.key)) {
    throw new Error(`Duplicate key '${row.key}' in site-settings contract`);
  }
  seen.add(row.key);

  const expected = requiredKeys.get(row.key);
  if (!expected) {
    throw new Error(`Missing expectation for key '${row.key}'`);
  }
  if (row.envFallback !== expected.envFallback) {
    throw new Error(`Invalid envFallback for key '${row.key}'`);
  }
  if (row.type !== expected.type) {
    throw new Error(`Invalid type for key '${row.key}'`);
  }
  if (Boolean(row.nullable) !== expected.nullable) {
    throw new Error(`Invalid nullable for key '${row.key}'`);
  }

  if (row.type === 'text') {
    if (!Number.isInteger(row.maxLength) || row.maxLength <= 0) {
      throw new Error(`Invalid maxLength for text key '${row.key}'`);
    }
  }
  if (row.type === 'url') {
    if (typeof row.allowInternalPath !== 'boolean') {
      throw new Error(`allowInternalPath must be boolean for url key '${row.key}'`);
    }
  }
}

for (const key of requiredKeys.keys()) {
  if (!seen.has(key)) {
    throw new Error(`Missing required key '${key}' in site-settings contract`);
  }
}

console.log(`[monetization] site settings contract valid (${parsed.keys.length} keys)`);
