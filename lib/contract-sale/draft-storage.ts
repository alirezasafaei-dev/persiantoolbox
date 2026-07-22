import type { SaleAgreementData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

export interface SaleAgreementDraft {
  id: string;
  data: SaleAgreementData;
  selectedPremiumClauses: string[];
  createdAt: string;
  updatedAt: string;
}

const storage = createDraftStorage<SaleAgreementDraft>({
  storageKey: 'persian-tools.contract-sale.v1',
  idPrefix: 'sa_',
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
