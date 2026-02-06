const DEFAULT_EXPIRES_HOURS = 24;
const MAX_EXPIRES_HOURS = 168;
const MIN_EXPIRES_HOURS = 1;

export function normalizeShareExpiryHours(input?: number): number {
  if (input === undefined || input === null || !Number.isFinite(input)) {
    return DEFAULT_EXPIRES_HOURS;
  }
  return Math.min(Math.max(Math.round(input), MIN_EXPIRES_HOURS), MAX_EXPIRES_HOURS);
}
