import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.cwd(), 'docs/monetization/alerting-decision-rules.json');
const parsed = JSON.parse(readFileSync(filePath, 'utf8'));

const validRoles = new Set(['engineering_lead', 'quality_engineer', 'ux_accessibility']);
const validDecisions = new Set(['scale', 'hold', 'rollback']);
const requiredKpis = new Set([
  'impression',
  'ctr',
  'rpm_arpu',
  'bounce_rate_revenue_paths',
  'subscription_conversion',
]);

if (parsed.version !== 1 || !Array.isArray(parsed.kpis)) {
  throw new Error('Invalid alerting decision rules root contract');
}

const seenKpis = new Set();
for (const kpi of parsed.kpis) {
  const requiredFields = [
    'id',
    'ownerRole',
    'yellowThreshold',
    'redThreshold',
    'decisionBySeverity',
  ];

  for (const field of requiredFields) {
    if (!(field in kpi)) {
      throw new Error(`Missing KPI field '${field}'`);
    }
  }

  if (!requiredKpis.has(kpi.id)) {
    throw new Error(`Unknown KPI id: ${kpi.id}`);
  }
  if (seenKpis.has(kpi.id)) {
    throw new Error(`Duplicate KPI id: ${kpi.id}`);
  }
  seenKpis.add(kpi.id);

  if (!validRoles.has(kpi.ownerRole)) {
    throw new Error(`Invalid ownerRole for KPI ${kpi.id}`);
  }

  const severityMap = kpi.decisionBySeverity;
  for (const severity of ['green', 'yellow', 'red']) {
    const decision = severityMap?.[severity];
    if (!validDecisions.has(decision)) {
      throw new Error(`Invalid decision mapping for KPI ${kpi.id} severity ${severity}`);
    }
  }
  if (severityMap.green !== 'scale' || severityMap.yellow !== 'hold' || severityMap.red !== 'rollback') {
    throw new Error(`Severity mapping must be scale/hold/rollback for KPI ${kpi.id}`);
  }
}

for (const kpiId of requiredKpis) {
  if (!seenKpis.has(kpiId)) {
    throw new Error(`Missing required KPI mapping: ${kpiId}`);
  }
}

const guards = parsed.globalGuards;
if (!guards || typeof guards !== 'object') {
  throw new Error('Missing globalGuards');
}

for (const key of ['privacyIncidentOpen', 'securityIncidentOpen', 'insufficientSignal']) {
  if (!validDecisions.has(guards[key])) {
    throw new Error(`Invalid global guard decision: ${key}`);
  }
}

if (guards.privacyIncidentOpen !== 'rollback' || guards.securityIncidentOpen !== 'rollback') {
  throw new Error('Privacy/Security guards must force rollback');
}

console.log(`[monetization] alerting decision rules contract valid (${parsed.kpis.length} KPI mappings)`);
