import type { BusinessProfile, BusinessParty } from './types';

const PROFILE_STORAGE_KEY = 'persian-tools.business-profiles.v1';

export function saveProfile(profile: BusinessProfile): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const existing = loadProfiles();
    const idx = existing.findIndex((p) => p.id === profile.id);
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      existing[idx] = updated;
    } else {
      existing.push(updated);
    }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // silently fail
  }
}

export function loadProfiles(): BusinessProfile[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as BusinessProfile[];
  } catch {
    return [];
  }
}

export function loadProfile(id: string): BusinessProfile | undefined {
  return loadProfiles().find((p) => p.id === id);
}

export function deleteProfile(id: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const profiles = loadProfiles().filter((p) => p.id !== id);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // silently fail
  }
}

export function createProfileId(): string {
  return `bprof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function partyToProfile(party: BusinessParty, logoDataUrl?: string): BusinessProfile {
  const profile: BusinessProfile = {
    id: createProfileId(),
    name: party.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (party.address) {
    profile.address = party.address;
  }
  if (party.phone) {
    profile.phone = party.phone;
  }
  if (party.email) {
    profile.email = party.email;
  }
  if (party.nationalId) {
    profile.nationalId = party.nationalId;
  }
  if (party.registrationNo) {
    profile.registrationNo = party.registrationNo;
  }
  if (party.economicCode) {
    profile.economicCode = party.economicCode;
  }
  if (logoDataUrl) {
    profile.logoDataUrl = logoDataUrl;
  }
  return profile;
}

export function profileToParty(profile: BusinessProfile): BusinessParty {
  const party: BusinessParty = { name: profile.name };
  if (profile.address) {
    party.address = profile.address;
  }
  if (profile.phone) {
    party.phone = profile.phone;
  }
  if (profile.email) {
    party.email = profile.email;
  }
  if (profile.nationalId) {
    party.nationalId = profile.nationalId;
  }
  if (profile.registrationNo) {
    party.registrationNo = profile.registrationNo;
  }
  if (profile.economicCode) {
    party.economicCode = profile.economicCode;
  }
  return party;
}
