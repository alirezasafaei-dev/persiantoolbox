import type { LeaseData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

export interface LeaseDraft {
  id: string;
  data: LeaseData;
  selectedPremiumClauses: string[];
  createdAt: string;
  updatedAt: string;
}

const storage = createDraftStorage<LeaseDraft>({
  storageKey: 'persian-tools.contract-lease.v1',
  idPrefix: 'rl_',
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
