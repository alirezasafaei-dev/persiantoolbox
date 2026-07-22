const STORAGE_KEY = 'pt_ab_tests';
const VISITOR_ID_KEY = 'pt_visitor_id';

export type ABTestConfig = {
  testName: string;
  variants: string[];
  weights?: number[];
};

type StoredAssignments = Record<string, string>;

function getHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value.charCodeAt(index);
    hash = (hash << 5) - hash + character;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function firstVariant(variants: string[]): string {
  return variants[0] ?? '';
}

function lastVariant(variants: string[]): string {
  return variants.at(-1) ?? '';
}

function parseStoredAssignments(): StoredAssignments {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? '{}';
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
}

export function getVariant(config: ABTestConfig): string {
  const { testName, variants, weights } = config;
  if (variants.length === 0) {
    return '';
  }
  if (typeof window === 'undefined') {
    return firstVariant(variants);
  }

  const stored = getStoredAssignment(testName);
  if (stored && variants.includes(stored)) {
    return stored;
  }

  const visitorId = getVisitorId();
  const hash = getHash(`${visitorId}:${testName}`);
  const totalWeight = weights
    ? weights.reduce((total, weight) => total + Math.max(weight, 0), 0)
    : variants.length;
  const safeTotalWeight = totalWeight > 0 ? totalWeight : variants.length;
  let cumulative = 0;
  const threshold = hash % safeTotalWeight;

  for (let index = 0; index < variants.length; index += 1) {
    cumulative += weights ? Math.max(weights[index] ?? 1, 0) : 1;
    if (threshold < cumulative) {
      const variant = variants[index] ?? firstVariant(variants);
      storeAssignment(testName, variant);
      trackExposure(testName, variant);
      return variant;
    }
  }

  const fallback = lastVariant(variants);
  storeAssignment(testName, fallback);
  trackExposure(testName, fallback);
  return fallback;
}

function getStoredAssignment(testName: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return parseStoredAssignments()[testName] ?? null;
}

function storeAssignment(testName: string, variant: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const data = parseStoredAssignments();
    data[testName] = variant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be disabled or full; assignment still works for this render.
  }
}

function trackExposure(testName: string, variant: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const event = new CustomEvent('ab-test-exposure', { detail: { testName, variant } });
    window.dispatchEvent(event);
  } catch {
    // Analytics exposure is best-effort and must not break rendering.
  }
}

export function clearAllTests(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
