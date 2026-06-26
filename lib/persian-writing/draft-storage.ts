import type { WritingDraft } from './types';

const DRAFT_STORAGE_KEY = 'persian-tools.writing-drafts.v1';
const FREE_MAX_DRAFTS = 5;

export function saveDraft(draft: WritingDraft): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const existing = loadDrafts();
    const idx = existing.findIndex((d) => d.id === draft.id);
    if (idx >= 0) {
      existing[idx] = { ...draft, updatedAt: new Date().toISOString() };
    } else {
      existing.push(draft);
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // silently fail
  }
}

export function loadDrafts(): WritingDraft[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as WritingDraft[];
  } catch {
    return [];
  }
}

export function loadDraft(id: string): WritingDraft | undefined {
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
    // silently fail
  }
}

export function getDraftCount(): number {
  return loadDrafts().length;
}

export function canSaveDraft(): boolean {
  return getDraftCount() < FREE_MAX_DRAFTS;
}

export function createDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
