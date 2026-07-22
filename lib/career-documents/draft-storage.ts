import type { CareerDocumentType, ResumeDraft } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

const storage = createDraftStorage<ResumeDraft>({
  storageKey: 'persian-tools.career-drafts.v1',
  idPrefix: 'cdoc_',
  freeMaxDrafts: FREE_MAX_DRAFTS,
  filterByType: (draft, type) => draft.documentType === (type as CareerDocumentType),
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
