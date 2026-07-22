import type { SalonData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

export interface SalonDraft {
  id: string;
  data: SalonData;
  selectedPremiumClauses: string[];
  createdAt: string;
  updatedAt: string;
}

const storage = createDraftStorage<SalonDraft>({
  storageKey: 'persian-tools.contract-salon.v1',
  idPrefix: 'salon_',
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
