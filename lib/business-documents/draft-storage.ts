import type { BusinessDocumentType, BusinessDocumentDraft } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

const storage = createDraftStorage<BusinessDocumentDraft>({
  storageKey: 'persian-tools.business-drafts.v1',
  idPrefix: 'bdoc_',
  freeMaxDrafts: FREE_MAX_DRAFTS,
  filterByType: (draft, type) => draft.documentType === (type as BusinessDocumentType),
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
