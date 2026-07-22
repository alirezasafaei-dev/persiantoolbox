type DraftBase = {
  id: string;
  updatedAt: string;
  documentType?: string;
};

type DraftStorageOptions<T extends DraftBase> = {
  storageKey: string;
  idPrefix: string;
  freeMaxDrafts: number;
  filterByType?: (draft: T, type: string) => boolean;
};

export function createDraftStorage<T extends DraftBase>(options: DraftStorageOptions<T>) {
  const { storageKey, idPrefix, freeMaxDrafts, filterByType } = options;

  function saveDraft(draft: T): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const existing = loadDrafts();
      const idx = existing.findIndex((d) => d.id === draft.id);
      if (idx >= 0) {
        existing[idx] = { ...draft, updatedAt: new Date().toISOString() } as T;
      } else {
        existing.push({ ...draft, updatedAt: new Date().toISOString() } as T);
      }
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch {
      // storage unavailable
    }
  }

  function loadDrafts(): T[] {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  function loadDraft(id: string): T | undefined {
    return loadDrafts().find((d) => d.id === id);
  }

  function deleteDraft(id: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const drafts = loadDrafts().filter((d) => d.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(drafts));
    } catch {
      // storage unavailable
    }
  }

  function getDraftCount(): number {
    return loadDrafts().length;
  }

  function canSaveDraft(type?: string): boolean {
    const drafts = loadDrafts();
    if (!type) {
      return drafts.length < freeMaxDrafts;
    }
    const count = filterByType
      ? drafts.filter((d) => filterByType(d, type)).length
      : drafts.filter((d) => d.documentType === type).length;
    return count < freeMaxDrafts;
  }

  function createDraftId(): string {
    return `${idPrefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return {
    saveDraft,
    loadDrafts,
    loadDraft,
    deleteDraft,
    getDraftCount,
    canSaveDraft,
    createDraftId,
  };
}
