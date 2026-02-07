import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/monetization/review-backlog.json');
const raw = readFileSync(filePath, 'utf8');
const parsed = JSON.parse(raw);

const requiredLabels = new Set(['revenue-growth', 'ux-risk', 'privacy-risk', 'data-quality']);
const requiredDecisions = new Set(['scale', 'hold', 'rollback']);
const requiredPriorities = new Set(['P0', 'P1', 'P2']);

if (parsed.version !== 1 || !Array.isArray(parsed.items)) {
  throw new Error('Invalid review-backlog root contract');
}

const ids = new Set();
let previousOrder = 0;
for (const item of parsed.items) {
  const requiredFields = ['id', 'title', 'source', 'decision', 'priority', 'order', 'labels', 'kpiTargets', 'owner'];
  for (const field of requiredFields) {
    if (!(field in item)) {
      throw new Error(`Missing field: ${field}`);
    }
  }

  if (typeof item.id !== 'string' || !/^MON-REV-\d{3}$/.test(item.id)) {
    throw new Error(`Invalid item id: ${item.id}`);
  }
  if (ids.has(item.id)) {
    throw new Error(`Duplicate item id: ${item.id}`);
  }
  ids.add(item.id);

  if (!requiredDecisions.has(item.decision)) {
    throw new Error(`Invalid decision: ${item.decision}`);
  }
  if (!requiredPriorities.has(item.priority)) {
    throw new Error(`Invalid priority: ${item.priority}`);
  }
  if (!Number.isInteger(item.order) || item.order <= previousOrder) {
    throw new Error(`Order must be strictly increasing: ${item.id}`);
  }
  previousOrder = item.order;

  if (!Array.isArray(item.labels) || item.labels.length === 0) {
    throw new Error(`Labels must be non-empty: ${item.id}`);
  }
  for (const label of item.labels) {
    if (!requiredLabels.has(label)) {
      throw new Error(`Invalid label '${label}' in ${item.id}`);
    }
  }

  if (!Array.isArray(item.kpiTargets) || item.kpiTargets.length === 0) {
    throw new Error(`kpiTargets must be non-empty: ${item.id}`);
  }
}

console.log(`[monetization] review backlog contract valid (${parsed.items.length} items)`);
