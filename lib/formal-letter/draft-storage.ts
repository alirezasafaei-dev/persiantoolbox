import type { FormalLetterData } from './types';
import { FREE_MAX_DRAFTS } from './schemas';
import { createDraftStorage } from '@/lib/draft-storage';

export interface FormalLetterDraft {
  id: string;
  data: FormalLetterData;
  selectedPremiumParagraphs: string[];
  createdAt: string;
  updatedAt: string;
}

const storage = createDraftStorage<FormalLetterDraft>({
  storageKey: 'persian-tools.formal-letter.v1',
  idPrefix: 'fl_',
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
