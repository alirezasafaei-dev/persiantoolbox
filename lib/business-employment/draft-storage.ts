import type { EmploymentData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

export interface EmploymentDraft {
  id: string;
  data: EmploymentData;
  selectedPremiumClauses: string[];
  createdAt: string;
  updatedAt: string;
}

const storage = createDraftStorage<EmploymentDraft>({
  storageKey: 'persian-tools.business-employment.v1',
  idPrefix: 'be_',
  freeMaxDrafts: FREE_MAX_DRAFTS,
});

export const {
  saveDraft,
  loadDrafts,
  loadDraft,
  deleteDraft,
  getDraftCount,
  canSaveDraft,
  createDraftId,
} = storage;
