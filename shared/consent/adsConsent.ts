export type AdsConsentState = {
  contextualAds: boolean;
  targetedAds: boolean;
  updatedAt: number | null;
  version: 1;
};

const STORAGE_KEY = 'persian-tools.ads-consent.v1';

const emptyState: AdsConsentState = {
  contextualAds: false,
  targetedAds: false,
  updatedAt: null,
  version: 1,
};

function normalizeState(state: Partial<AdsConsentState> | null | undefined): AdsConsentState {
  const merged: AdsConsentState = {
    ...emptyState,
    ...(state ?? {}),
    version: 1,
  };

  if (!merged.contextualAds) {
    merged.targetedAds = false;
  }

  if (merged.targetedAds) {
    merged.contextualAds = true;
  }

  return merged;
}

function readState(): AdsConsentState {
  if (typeof window === 'undefined') {
    return { ...emptyState };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...emptyState };
    }
    const parsed = JSON.parse(raw) as AdsConsentState;
    return normalizeState(parsed);
  } catch {
    return { ...emptyState };
  }
}

function writeState(state: AdsConsentState): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getAdsConsent(): AdsConsentState {
  return readState();
}

export function updateAdsConsent(patch: Partial<AdsConsentState>): AdsConsentState {
  if (typeof window === 'undefined') {
    return normalizeState(patch);
  }

  const current = readState();
  const next = normalizeState({
    ...current,
    ...patch,
    updatedAt: Date.now(),
  });

  writeState(next);
  return next;
}

export function clearAdsConsent(): AdsConsentState {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return { ...emptyState };
}
