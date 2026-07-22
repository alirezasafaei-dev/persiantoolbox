import type { WritingDraft } from './types';
import { createDraftStorage } from '@/lib/draft-storage';

const FREE_MAX_DRAFTS = 5;

const storage = createDraftStorage<WritingDraft>({
  storageKey: 'persian-tools.writing-drafts.v1',
  idPrefix: 'draft_',
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
