import type { WorkCertificateData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';

const DRAFT_STORAGE_KEY = 'persian-tools.work-certificate.v1';

export interface WorkCertificateDraft {
  id: string;
  data: WorkCertificateData;
  createdAt: string;
  updatedAt: string;
}

export function saveDraft(draft: WorkCertificateDraft): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const existing = loadDrafts();
    const idx = existing.findIndex((d) => d.id === draft.id);
    if (idx >= 0) {
      existing[idx] = { ...draft, updatedAt: new Date().toISOString() };
    } else {
      existing.push({ ...draft, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    /* silently fail */
  }
}

export function loadDrafts(): WorkCertificateDraft[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as WorkCertificateDraft[];
  } catch {
    return [];
  }
}

export function loadDraft(id: string): WorkCertificateDraft | undefined {
  return loadDrafts().find((d) => d.id === id);
}

export function deleteDraft(id: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const drafts = loadDrafts().filter((d) => d.id !== id);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* silently fail */
  }
}

export function getDraftCount(): number {
  return loadDrafts().length;
}

export function canSaveDraft(): boolean {
  return getDraftCount() < FREE_MAX_DRAFTS;
}

export function createDraftId(): string {
  return `wc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
