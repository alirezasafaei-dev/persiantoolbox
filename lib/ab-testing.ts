const STORAGE_KEY = 'pt_ab_tests';

type ABTestConfig = {
  testName: string;
  variants: string[];
  weights?: number[];
};

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('pt_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('pt_visitor_id', id);
  }
  return id;
}

export function getVariant(config: ABTestConfig): string {
  const { testName, variants, weights } = config;
  if (variants.length === 0) return '';
  if (typeof window === 'undefined') return variants[0]!;

  const stored = getStoredAssignment(testName);
  if (stored && variants.includes(stored)) return stored;

  const visitorId = getVisitorId();
  const hash = getHash(`${visitorId}:${testName}`);

  const totalWeight = weights ? weights.reduce((a, b) => a + b, 0) : variants.length;
  let cumulative = 0;
  const threshold = hash % totalWeight;

  for (let i = 0; i < variants.length; i++) {
    cumulative += weights ? (weights[i] ?? 1) : 1;
    if (threshold < cumulative) {
      const variant = variants[i]!;
      storeAssignment(testName, variant);
      trackExposure(testName, variant);
      return variant;
    }
  }

  return variants[variants.length - 1]!;
}

function getStoredAssignment(testName: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data[testName] || null;
  } catch {
    return null;
  }
}

function storeAssignment(testName: string, variant: string): void {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[testName] = variant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or disabled
  }
}

function trackExposure(testName: string, variant: string): void {
  if (typeof window === 'undefined') return;
  try {
    const event = new CustomEvent('ab-test-exposure', { detail: { testName, variant } });
    window.dispatchEvent(event);
  } catch {
    // event dispatch failed
  }
}

export function clearAllTests(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
