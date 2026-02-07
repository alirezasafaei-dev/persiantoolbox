const SUBJECT_KEY = 'persian-tools.ad-experiment.subject.v1';
const ASSIGNMENTS_KEY = 'persian-tools.ad-experiment.assignments.v1';

type AssignmentState = Record<string, string>;

function readAssignments(): AssignmentState {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as AssignmentState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAssignments(next: AssignmentState) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next));
}

function getSubjectId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }
  const existing = window.localStorage.getItem(SUBJECT_KEY);
  if (existing) {
    return existing;
  }
  const generated = Math.random().toString(36).slice(2, 12);
  window.localStorage.setItem(SUBJECT_KEY, generated);
  return generated;
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getOrAssignExperimentVariant(
  experimentKey: string,
  variantIds: readonly string[],
): string {
  if (variantIds.length === 0) {
    return 'control';
  }

  const assignments = readAssignments();
  const existing = assignments[experimentKey];
  if (existing && variantIds.includes(existing)) {
    return existing;
  }

  const subject = getSubjectId();
  const seed = `${subject}:${experimentKey}`;
  const selected = variantIds[hashSeed(seed) % variantIds.length] ?? variantIds[0] ?? 'control';

  writeAssignments({
    ...assignments,
    [experimentKey]: selected,
  });
  return selected;
}
