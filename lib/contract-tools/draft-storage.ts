import type { ContractTemplateId } from './types';

const DRAFT_STORAGE_KEY = 'persian-tools.contract-drafts.v1';

export type DraftRecord = {
  id: string;
  templateId: ContractTemplateId;
  templateVersion: string;
  createdAt: number;
  updatedAt: number;
  inputs: Record<string, string>;
  selectedClauses: string[];
  name: string;
};

function getStorageKey(templateId: string): string {
  return `${DRAFT_STORAGE_KEY}.${templateId}`;
}

export function saveDraft(draft: DraftRecord): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const key = getStorageKey(draft.templateId);
    const existing = loadDrafts(draft.templateId);
    const idx = existing.findIndex((d) => d.id === draft.id);
    if (idx >= 0) {
      existing[idx] = { ...draft, updatedAt: Date.now() };
    } else {
      existing.push(draft);
    }
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // silently fail
  }
}

export function loadDrafts(templateId: ContractTemplateId): DraftRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const key = getStorageKey(templateId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as DraftRecord[];
  } catch {
    return [];
  }
}

export function deleteDraft(templateId: ContractTemplateId, draftId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const key = getStorageKey(templateId);
    const drafts = loadDrafts(templateId).filter((d) => d.id !== draftId);
    localStorage.setItem(key, JSON.stringify(drafts));
  } catch {
    // silently fail
  }
}

export function getLatestDraft(templateId: ContractTemplateId): DraftRecord | undefined {
  const drafts = loadDrafts(templateId);
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

export function createDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
